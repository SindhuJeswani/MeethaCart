import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SplashScreen from './components/common/SplashScreen';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerPublicProfile from './pages/buyer/SellerPublicProfile';
import BrowseItems from './pages/buyer/BrowseItems';
import ItemDetails from './pages/buyer/ItemDetails';
import SellerItems from './pages/seller/SellerItems';
import AddEditItem from './pages/seller/AddEditItem';
import AdminDashboard from './pages/admin/AdminDashboard';
import SellerApprovals from './pages/admin/SellerApprovals';
import CategoryManager from './pages/admin/CategoryManager';
import UserList from './pages/admin/UserList';
import OrdersPlaceholder from './pages/admin/OrdersPlaceholder';
import UnderBaking from './pages/UnderBaking';
import NotFound from './pages/NotFound';
import { UNDER_BAKING_ROUTES } from './config/underBakingRoutes';

// Visitor Entry point: handles first-time vs returning guest vs logged-in user
const IndexRoute = () => {
  const { user, token } = useAuth();

  // 1. Returning logged-in user: route to appropriate role destination
  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    return <Home />;
  }

  // 2. Returning guest: if user previously browsed or selected language, go straight to marketplace
  const hasVisited = localStorage.getItem('meethacart_guest_visited');
  const hasLangSelected = localStorage.getItem('meethacart_lang_selected');
  if (hasVisited || hasLangSelected) {
    return <Home />;
  }

  // 3. First-time visitor: show welcome screen
  return <Navigate to="/welcome" replace />;
};

function AppContent() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem('meethacart_splash_seen');
    return !prefersReduced && !alreadySeen;
  });

  const isWelcomePage = location.pathname === '/welcome';

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="min-h-screen flex flex-col bg-bakery-50 text-bakery-900 font-sans selection:bg-amber-200 selection:text-amber-900">
        {!isWelcomePage && <Navbar />}
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexRoute />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/seller/:id" element={<SellerPublicProfile />} />
            <Route path="/items" element={<BrowseItems />} />
            <Route path="/items/:id" element={<ItemDetails />} />

            {/* Protected Buyer Routes */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Seller Routes */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/items"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/items/new"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <AddEditItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/items/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <AddEditItem />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes (M2) */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sellers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SellerApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OrdersPlaceholder />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Under-Baking Routes */}
            {UNDER_BAKING_ROUTES.map((route) => {
              const element = (
                <UnderBaking
                  title={route.title}
                  titleUrdu={route.titleUrdu}
                  description={route.description}
                  descUrdu={route.descUrdu}
                />
              );

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.allowedRoles ? (
                      <ProtectedRoute allowedRoles={route.allowedRoles}>
                        {element}
                      </ProtectedRoute>
                    ) : (
                      element
                    )
                  }
                />
              );
            })}

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isWelcomePage && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

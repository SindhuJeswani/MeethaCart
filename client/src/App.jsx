import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { FEATURES } from './config/features';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/guards/ProtectedRoute';
import SplashScreen from './components/common/SplashScreen';
import TopProgressBar from './components/common/TopProgressBar';
import ThemePicker from './components/common/ThemePicker';

// Public Pages (Milestone 3)
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import BrowseItems from './pages/buyer/BrowseItems';
import ItemDetails from './pages/buyer/ItemDetails';
import SellerPublicProfile from './pages/buyer/SellerPublicProfile';

// Protected Buyer Pages (Milestone 3)
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Protected Seller Pages (Milestone 3)
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerItems from './pages/seller/SellerItems';
import AddEditItem from './pages/seller/AddEditItem';

// Protected Admin Pages (Milestone 3)
import AdminDashboard from './pages/admin/AdminDashboard';
import SellerApprovals from './pages/admin/SellerApprovals';
import CategoryManager from './pages/admin/CategoryManager';
import UserList from './pages/admin/UserList';

// 404 Not Found Page
import NotFound from './pages/NotFound';

// Future Pages (Loaded conditionally behind FEATURES flags)
import CartPage from './pages/buyer/CartPage';
import OrderTrackingPage from './pages/buyer/OrderTrackingPage';
import WalletPage from './pages/buyer/WalletPage';
import NotificationsPage from './pages/buyer/NotificationsPage';
import CustomRequestsPage from './pages/buyer/CustomRequestsPage';

// Visitor Entry point: handles first-time vs returning guest vs logged-in user
const IndexRoute = () => {
  const { user, token } = useAuth();

  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    return <Home />;
  }

  const hasVisited = localStorage.getItem('meethacart_guest_visited');
  const hasLangSelected = localStorage.getItem('meethacart_lang_selected');
  if (hasVisited || hasLangSelected) {
    return <Home />;
  }

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
  const isAuthPage = [
    '/welcome',
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);

  return (
    <>
      <TopProgressBar />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="min-h-screen flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900" style={{ backgroundColor: 'var(--color-bg)' }}>
        {!isWelcomePage && <Navbar />}
        <main className="flex-1 flex flex-col overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <Routes location={location}>
                {/* ── Public Milestone 3 Routes ── */}
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

                {/* ── Post-Milestone 3 Routes (Locked behind Feature Flags -> 404) ── */}
                <Route
                  path="/cart"
                  element={FEATURES.CART_AND_CHECKOUT ? <CartPage /> : <NotFound />}
                />
                <Route
                  path="/checkout"
                  element={FEATURES.CART_AND_CHECKOUT ? <CartPage /> : <NotFound />}
                />
                <Route
                  path="/orders"
                  element={FEATURES.ORDERS_AND_TRACKING ? <OrderTrackingPage /> : <NotFound />}
                />
                <Route
                  path="/orders/:id"
                  element={FEATURES.ORDERS_AND_TRACKING ? <OrderTrackingPage /> : <NotFound />}
                />
                <Route
                  path="/wallet"
                  element={FEATURES.WALLET_AND_PAYMENTS ? <WalletPage /> : <NotFound />}
                />
                <Route
                  path="/notifications"
                  element={FEATURES.NOTIFICATIONS ? <NotificationsPage /> : <NotFound />}
                />
                <Route
                  path="/custom-requests"
                  element={FEATURES.CUSTOM_REQUESTS_BIDDING ? <CustomRequestsPage /> : <NotFound />}
                />

                {/* ── Protected Buyer Routes (Milestone 3) ── */}
                <Route
                  path="/buyer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Protected Seller Routes (Milestone 3) ── */}
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

                {/* ── Protected Admin Routes (Milestone 3) ── */}
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
                  element={<NotFound />}
                />

                {/* ── 404 Catch-All ── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        {!isWelcomePage && <Footer />}

        {/* Floating Theme Switcher on Pre-login / Auth / Welcome Pages */}
        {isAuthPage && <ThemePicker variant="floating" />}
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <AppContent />
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

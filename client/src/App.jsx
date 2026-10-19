import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Pages
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-bakery-50 text-bakery-900 font-sans selection:bg-amber-200 selection:text-amber-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
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

                {/* 404 Catch-All */}
                <Route
                  path="*"
                  element={
                    <div className="max-w-md mx-auto px-4 py-20 text-center">
                      <h2 className="text-4xl font-serif font-bold text-chocolate mb-2">404</h2>
                      <p className="text-sm text-bakery-600 mb-6">Page not found.</p>
                      <a href="/" className="btn-primary inline-flex text-sm">
                        Return to Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

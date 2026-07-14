import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Shop Pages
import Home from '../pages/Shop/Home';
import ProductsCatalog from '../pages/Shop/ProductsCatalog';
import ProductDetails from '../pages/Shop/ProductDetails';
import Cart from '../pages/Shop/Cart';
import Wishlist from '../pages/Shop/Wishlist';
import Checkout from '../pages/Shop/Checkout';
import OrderSuccess from '../pages/Shop/OrderSuccess';
import MyOrders from '../pages/Shop/MyOrders';
import UserProfile from '../pages/Shop/UserProfile';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';

// Company Pages
import About from '../pages/Company/About';
import Contact from '../pages/Company/Contact';

// Admin Pages
import DashboardOverview from '../pages/Admin/DashboardOverview';
import ManageProducts from '../pages/Admin/ManageProducts';
import ManageCategories from '../pages/Admin/ManageCategories';
import ManageOrders from '../pages/Admin/ManageOrders';

// Common components
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Client Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Shop Routes inside MainLayout */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/products" element={<MainLayout><ProductsCatalog /></MainLayout>} />
      <Route path="/products/:slug" element={<MainLayout><ProductDetails /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

      {/* Protected Customer Routes */}
      <Route path="/wishlist" element={<ProtectedRoute><MainLayout><Wishlist /></MainLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><MainLayout><OrderSuccess /></MainLayout></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><MainLayout><MyOrders /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />

      {/* Auth Routes (No layout or custom page layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><DashboardOverview /></AdminLayout></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminLayout><ManageProducts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminLayout><ManageCategories /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminLayout><ManageOrders /></AdminLayout></AdminRoute>} />

      {/* 404 Page Fallback */}
      <Route
        path="*"
        element={
          <MainLayout>
            <div style={{ padding: '150px 24px', textAlign: 'center', backgroundColor: 'var(--bg-primary)', minHeight: '60vh' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>404 - Page Not Found</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>The page you are looking for does not exist or has been relocated.</p>
              <a href="/" className="btn btn-primary">
                Return Home
              </a>
            </div>
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

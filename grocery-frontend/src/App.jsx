import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import ChatPopup from './components/ChatPopup';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Invoices from './pages/Invoices';
import Admin from './pages/Admin';
import './index.css';

function Home() {
  return (
    <>
      <Navbar />
      <div className="hero">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to <span className="highlight">GroceryStore</span>
              </h1>
              <p className="lead mb-4">
                Shop fresh groceries, household essentials, and much more from the comfort of your home. Fast delivery, quality products, and unbeatable prices!
              </p>
              <div className="d-flex gap-3">
                <a href="/products" className="btn btn-primary btn-lg">
                  <i className="bi bi-shop"></i> Shop Now
                </a>
                <a href="/register" className="btn btn-outline-primary btn-lg">
                  Get Started
                </a>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛍️</div>
                  <p className="text-muted fs-5">
                    Your favorite grocery store, delivered to your door
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Get your groceries delivered within hours of ordering</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Quality Assured</h3>
              <p>All products are carefully selected for freshness and quality</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing and regular discounts on all items</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Products />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Cart />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Wishlist />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Invoices />
                  </>
                </ProtectedRoute>
              }
            />
            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={
                  <>
                    <Navbar />
                    <Admin />
                  </>
                }
              />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Chat Popup - Available on all pages */}
          <ChatPopup />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

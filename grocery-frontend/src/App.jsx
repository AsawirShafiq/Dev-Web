import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './index.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Invoices from './pages/Invoices';

// Home Page
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to <span className="text-green-600">GroceryStore</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Shop fresh groceries, household essentials, and much more from the comfort of your home. Fast delivery, quality products, and unbeatable prices!
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="/products"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-3 rounded-lg transition duration-200 inline-block"
              >
                Shop Now
              </a>
              <a
                href="/register"
                className="bg-white hover:bg-gray-50 text-green-600 border border-green-600 font-semibold px-8 py-3 rounded-lg transition duration-200 inline-block"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-8xl mb-4">🛍️</div>
              <p className="text-gray-600 text-lg">Your favorite grocery store, delivered to your door</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your groceries delivered within hours of ordering</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Quality Assured</h3>
            <p className="text-gray-600">All products are carefully selected for freshness and quality</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive pricing and regular discounts on all items</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
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

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

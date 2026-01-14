import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-white text-2xl font-bold">🛒 GroceryStore</div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link to="/products" className="text-white hover:text-green-100 transition">
                  Products
                </Link>
                <Link to="/wishlist" className="text-white hover:text-green-100 transition">
                  Wishlist
                </Link>
                <Link to="/invoices" className="text-white hover:text-green-100 transition">
                  Invoices
                </Link>
              </>
            )}
          </div>

          {/* Cart and Auth */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  className="relative text-white hover:text-green-100 transition flex items-center space-x-1"
                >
                  <span>🛒 Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-3 border-l border-green-500 pl-4">
                  <span className="text-white text-sm">Welcome, {user?.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && (
          <div className="md:hidden pb-4 flex flex-wrap gap-3">
            <Link to="/products" className="text-white hover:text-green-100 text-sm">
              Products
            </Link>
            <Link to="/wishlist" className="text-white hover:text-green-100 text-sm">
              Wishlist
            </Link>
            <Link to="/invoices" className="text-white hover:text-green-100 text-sm">
              Invoices
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

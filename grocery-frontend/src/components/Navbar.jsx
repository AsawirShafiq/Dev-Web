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
    <nav 
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        padding: '1rem 0'
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-shop"></i>
          <span>GroceryStore</span>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/products">
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/wishlist">
                    Wishlist
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/invoices">
                    Invoices
                  </Link>
                </li>
                {user?.usertype === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link text-warning" to="/admin">
                      <i className="bi bi-speedometer2"></i> Admin
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center ms-3 gap-3">
            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  className="nav-link position-relative"
                  style={{ color: 'white' }}
                >
                  <i className="bi bi-cart3" style={{ fontSize: '1.3rem' }}></i>
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </Link>

                <div className="vr" style={{ height: '2rem', color: 'rgba(255,255,255,0.3)' }}></div>

                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-light dropdown-toggle"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle"></i> {user?.username}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-light btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

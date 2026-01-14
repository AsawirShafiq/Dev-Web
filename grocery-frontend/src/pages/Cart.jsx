import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService, invoiceService } from '../services/authService';

export default function Cart() {
  const { cartItems, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProductDetails();
    }
  }, [cartItems]);

  const fetchProductDetails = async () => {
    try {
      const productMap = {};
      for (const item of cartItems) {
        if (!productMap[item.product_id]) {
          const response = await productService.getProduct(item.product_id);
          productMap[item.product_id] = response.data;
        }
      }
      setProducts(productMap);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products[item.product_id];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleRemove = async (productId) => {
    if (!user?.id) return;
    try {
      await removeFromCart(user.id, productId);
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!user?.id) return;

    setChecking(true);
    try {
      const invoiceData = {
        user_id: user.id,
        products: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      await invoiceService.createInvoice(invoiceData);
      alert('Order placed successfully!');

      for (const item of cartItems) {
        await removeFromCart(user.id, item.product_id);
      }

      navigate('/invoices');
    } catch (error) {
      alert('Checkout failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status"></div>
          <p className="text-muted">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="container">
        <h1 className="mb-4"><i className="bi bi-cart3"></i> Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0">
                <div className="card-body p-0">
                  {cartItems.map((item) => {
                    const product = products[item.product_id];
                    return (
                      <div key={item.id} className="border-bottom p-4 d-flex gap-4">
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {product?.image_url ? (
                            <img src={product.image_url} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                          ) : (
                            <span style={{ fontSize: '2rem' }}>📦</span>
                          )}
                        </div>

                        <div className="flex-grow-1">
                          <h5 className="mb-2">{product?.name || 'Loading...'}</h5>
                          {product?.brand && <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>Brand: {product.brand}</p>}
                          <div className="d-flex justify-content-between align-items-center">
                            <span style={{ color: '#10b981', fontWeight: 600 }}>${product?.price.toFixed(2) || '0.00'}</span>
                            <span className="text-muted">Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-end" style={{ minWidth: '120px' }}>
                          <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>${product ? (product.price * item.quantity).toFixed(2) : '0.00'}</p>
                          <button onClick={() => handleRemove(item.product_id)} className="btn btn-link btn-sm text-danger mt-2">
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="amount">${(totalPrice * 1.1).toFixed(2)}</span>
                </div>

                <button onClick={handleCheckout} disabled={checking} className="btn btn-primary w-100 mt-4 mb-3">
                  {checking ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <button onClick={() => navigate('/products')} className="btn btn-outline-primary w-100">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/authService';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, addToCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (wishlistItems.length > 0) {
      fetchProductDetails();
    }
  }, [wishlistItems]);

  const fetchProductDetails = async () => {
    try {
      const productMap = {};
      for (const item of wishlistItems) {
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

  const handleRemove = async (productId) => {
    if (!user?.id) return;
    try {
      await removeFromWishlist(user.id, productId);
    } catch (error) {
      alert('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user?.id) return;
    try {
      const product = products[productId];
      await addToCart(user.id, product, 1);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status"></div>
          <p className="text-muted">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="container-lg">
        <h1 className="mb-4"><i className="bi bi-heart"></i> My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤍</div>
            <h2>Your wishlist is empty</h2>
            <p>Add items to your wishlist to save them for later</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {wishlistItems.map((item) => {
              const product = products[item.product_id];
              return (
                <div key={item.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <div className="card product-card h-100">
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px', backgroundColor: '#f3f4f6' }}>
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📦</div>
                      )}
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{product?.name || 'Loading...'}</h5>
                      {product?.brand && <p className="card-text text-muted" style={{ fontSize: '0.875rem' }}>Brand: {product.brand}</p>}
                      {product?.description && (
                        <p className="card-text text-muted" style={{
                          fontSize: '0.875rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.description}
                        </p>
                      )}

                      <div className="mb-3">
                        <span className="product-price">${product?.price.toFixed(2) || '0.00'}</span>
                        {product && product.stock > 0 ? (
                          <small className="ms-2" style={{ color: '#10b981', fontWeight: 500 }}>✓ In Stock</small>
                        ) : (
                          <small className="ms-2" style={{ color: '#ef4444', fontWeight: 500 }}>Out of Stock</small>
                        )}
                      </div>

                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => handleAddToCart(item.product_id)}
                          disabled={product && product.stock === 0}
                          className="btn btn-primary flex-grow-1 btn-sm"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

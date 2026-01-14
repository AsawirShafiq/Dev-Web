import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!user?.id) return;
    try {
      await addToCart(user.id, product, 1);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user?.id) return;
    try {
      if (inWishlist) {
        await removeFromWishlist(user.id, product.id);
      } else {
        await addToWishlist(user.id, product.id);
      }
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  return (
    <div className="card product-card h-100">
      {/* Image Container */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '200px', backgroundColor: '#f3f4f6' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="card-img-top"
            style={{ height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            📦
          </div>
        )}
        <button
          onClick={handleWishlistToggle}
          className="wishlist-btn"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            backgroundColor: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Content */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{ fontSize: '1rem', fontWeight: 600 }}>
          {product.name}
        </h5>

        {product.brand && (
          <p className="card-text" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Brand: {product.brand}
          </p>
        )}

        {product.description && (
          <p className="card-text" style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </p>
        )}

        {product.category && (
          <span className="product-category">
            {product.category}
          </span>
        )}

        {/* Stock Status */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <small style={{ color: '#10b981', fontWeight: 500 }}>
              ✓ In Stock: {product.stock}
            </small>
          ) : (
            <small style={{ color: '#ef4444', fontWeight: 500 }}>
              Out of Stock
            </small>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="product-price">${product.price.toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="d-flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary flex-grow-1"
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

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
    } catch {
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
    } catch {
      alert('Failed to update wishlist');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Container */}
      <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-4xl">📦</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>

        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">Brand: {product.brand}</p>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}

        {product.category && (
          <p className="text-xs bg-green-100 text-green-800 inline-block px-2 py-1 rounded mb-3 w-fit">
            {product.category}
          </p>
        )}

        {/* Stock Status */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <p className="text-sm text-green-600 font-medium">In Stock: {product.stock}</p>
          ) : (
            <p className="text-sm text-red-600 font-medium">Out of Stock</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Add to Cart
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
              inWishlist
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
}

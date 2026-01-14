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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">🤍</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Add items to your wishlist to save them for later</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const product = products[item.product_id];
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  {/* Image */}
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    {product?.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product?.name || 'Loading...'}
                    </h3>

                    {product?.brand && (
                      <p className="text-sm text-gray-500 mb-2">Brand: {product.brand}</p>
                    )}

                    {product?.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ${product?.price.toFixed(2) || '0.00'}
                      </span>
                      {product && product.stock > 0 ? (
                        <span className="text-sm text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        disabled={product && product.stock === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Remove
                      </button>
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

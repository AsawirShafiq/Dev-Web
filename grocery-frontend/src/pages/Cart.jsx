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

      // Clear cart by removing all items
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {cartItems.map((item) => {
                  const product = products[item.product_id];
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-6 border-b last:border-b-0 hover:bg-gray-50 transition"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product?.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {product?.name || 'Loading...'}
                        </h3>
                        {product?.brand && (
                          <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-green-600 font-semibold">
                            ${product?.price.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      {/* Total and Remove */}
                      <div className="text-right flex flex-col justify-between">
                        <p className="text-xl font-bold text-gray-900">
                          ${product ? (product.price * item.quantity).toFixed(2) : '0.00'}
                        </p>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${(totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${(totalPrice * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checking}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition duration-200 mb-4"
                >
                  {checking ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
                >
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

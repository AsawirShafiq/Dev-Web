import { createContext, useContext, useState, useEffect } from 'react';
import { cartService, wishlistService } from '../services/authService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart and wishlist when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCartAndWishlist(user.id);
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [user]);

  const fetchCartAndWishlist = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const [cartRes, wishlistRes] = await Promise.all([
        cartService.getCart(userId),
        wishlistService.getWishlist(userId),
      ]);
      setCartItems(cartRes.data);
      setWishlistItems(wishlistRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (userId, product, quantity = 1) => {
    try {
      setError(null);
      const response = await cartService.addToCart(userId, {
        product_id: product.id,
        quantity,
      });
      setCartItems((prev) => {
        const exists = prev.find((item) => item.product_id === product.id);
        if (exists) {
          return prev.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, response.data];
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromCart = async (userId, productId) => {
    try {
      setError(null);
      await cartService.deleteCartItem(userId, productId);
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addToWishlist = async (userId, productId) => {
    try {
      setError(null);
      const response = await wishlistService.addToWishlist(userId, {
        product_id: productId,
      });
      setWishlistItems((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromWishlist = async (userId, productId) => {
    try {
      setError(null);
      await wishlistService.deleteWishlistItem(userId, productId);
      setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item.product_id === productId);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartItemCount,
        fetchCartAndWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

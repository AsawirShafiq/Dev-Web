import api from './api';

export const authService = {
  register: (userData) => api.post('/users', userData),
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/token', formData);
  },
  getCurrentUser: () => api.get('/users'),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export const productService = {
  getAllProducts: () => api.get('/products'),
  getProduct: (productId) => api.get(`/products/${productId}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
};

export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, cartItem) => api.post(`/cart/${userId}`, cartItem),
  deleteCartItem: (userId, productId) => api.delete(`/cart/${userId}/${productId}`),
};

export const wishlistService = {
  getWishlist: (userId) => api.get(`/wishlist/${userId}`),
  addToWishlist: (userId, wishlistItem) => api.post(`/wishlist/${userId}`, wishlistItem),
  deleteWishlistItem: (userId, productId) => api.delete(`/wishlist/${userId}/${productId}`),
};

export const invoiceService = {
  getAllInvoices: () => api.get('/invoices'),
  getInvoice: (invoiceId) => api.get(`/invoices/${invoiceId}`),
  createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
  deleteInvoice: (invoiceId) => api.delete(`/invoices/${invoiceId}`),
};

export const kpiService = {
  getTotalUsers: () => api.get('/kpi/total-users'),
  getTotalProducts: () => api.get('/kpi/total-products'),
  getTotalInvoices: () => api.get('/kpi/total-invoices'),
  getTotalRevenue: () => api.get('/kpi/total-revenue'),
  getAverageOrderValue: () => api.get('/kpi/average-order-value'),
  getTotalCartItems: () => api.get('/kpi/total-cart-items'),
  getTotalWishlistItems: () => api.get('/kpi/total-wishlist-items'),
  getActiveCustomers: () => api.get('/kpi/active-customers'),
  getTopSellingProducts: () => api.get('/kpi/top-selling-products'),
};

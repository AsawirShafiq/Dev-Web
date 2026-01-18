import api from './api';

export const adminService = {
  // Users management
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),

  // Products management
  getAllProducts: () => api.get('/products'),
  getProductById: (productId) => api.get(`/products/${productId}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),

  // KPIs
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

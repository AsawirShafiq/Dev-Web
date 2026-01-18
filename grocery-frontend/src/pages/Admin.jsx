import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('kpis');
  const [kpis, setKpis] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    if (activeTab === 'kpis') {
      fetchKPIs();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const [users, products, invoices, revenue, aov, cartItems, wishlistItems, activeCustomers, topProducts] = await Promise.all([
        adminService.getTotalUsers(),
        adminService.getTotalProducts(),
        adminService.getTotalInvoices(),
        adminService.getTotalRevenue(),
        adminService.getAverageOrderValue(),
        adminService.getTotalCartItems(),
        adminService.getTotalWishlistItems(),
        adminService.getActiveCustomers(),
        adminService.getTopSellingProducts()
      ]);
      setKpis({
        totalUsers: users.data?.total_users || 0,
        totalProducts: products.data?.total_products || 0,
        totalInvoices: invoices.data?.total_invoices || 0,
        totalRevenue: revenue.data?.total_revenue || 0,
        averageOrderValue: aov.data?.average_order_value || 0,
        totalCartItems: cartItems.data?.total_cart_items || 0,
        totalWishlistItems: wishlistItems.data?.total_wishlist_items || 0,
        activeCustomers: activeCustomers.data?.active_customers || 0,
        topSellingProducts: topProducts.data?.top_selling_products || []
      });
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      alert('Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      });
      setNewProduct({
        name: '',
        brand: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image_url: ''
      });
      alert('Product created successfully');
      fetchProducts();
    } catch (error) {
      alert('Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateProduct(editingProduct.id, {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock)
      });
      setEditingProduct(null);
      alert('Product updated successfully');
      fetchProducts();
    } catch (error) {
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        alert('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleChangeUserType = async (userId, currentType) => {
    const newType = currentType === 'admin' ? 'customer' : 'admin';
    if (window.confirm(`Change user type to ${newType}?`)) {
      try {
        await adminService.updateUser(userId, { usertype: newType });
        alert(`User type changed to ${newType}`);
        fetchUsers();
      } catch (error) {
        alert('Failed to update user type');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        alert('User deleted successfully');
        fetchUsers();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#f9fafb' }}>
      <div className="container-lg">
        <h1 className="mb-4"><i className="bi bi-speedometer2"></i> Admin Dashboard</h1>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'kpis' ? 'active' : ''}`}
              onClick={() => setActiveTab('kpis')}
            >
              <i className="bi bi-graph-up"></i> KPIs
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="bi bi-box"></i> Products
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people"></i> Users
            </button>
          </li>
        </ul>

        {/* Loading State */}
        {loading && (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border mb-3" role="status"></div>
              <p className="text-muted">Loading...</p>
            </div>
          </div>
        )}

        {/* KPIs Tab */}
        {!loading && activeTab === 'kpis' && (
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Users</h6>
                  <h2 className="card-title" style={{ color: '#10b981' }}>{kpis.totalUsers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Products</h6>
                  <h2 className="card-title" style={{ color: '#3b82f6' }}>{kpis.totalProducts}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Invoices</h6>
                  <h2 className="card-title" style={{ color: '#f59e0b' }}>{kpis.totalInvoices}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Revenue</h6>
                  <h2 className="card-title" style={{ color: '#ef4444' }}>${kpis.totalRevenue?.toFixed(2)}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Average Order Value</h6>
                  <h2 className="card-title" style={{ color: '#8b5cf6' }}>${kpis.averageOrderValue?.toFixed(2)}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Cart Items</h6>
                  <h2 className="card-title" style={{ color: '#06b6d4' }}>{kpis.totalCartItems}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #ec4899' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Wishlist Items</h6>
                  <h2 className="card-title" style={{ color: '#ec4899' }}>{kpis.totalWishlistItems}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card" style={{ borderLeft: '4px solid #14b8a6' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Active Customers</h6>
                  <h2 className="card-title" style={{ color: '#14b8a6' }}>{kpis.activeCustomers}</h2>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted mb-3">Top Selling Products</h6>
                  {Array.isArray(kpis.topSellingProducts) && kpis.topSellingProducts.length > 0 ? (
                    <div className="row">
                      {kpis.topSellingProducts.slice(0, 5).map((product, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4 mb-2">
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#f0f4ff',
                            borderRadius: '0.5rem',
                            borderLeft: '3px solid #6366f1'
                          }}>
                            <p className="mb-1" style={{ fontWeight: 600, color: '#1e293b' }}>
                              {product.product_name || product.name || 'N/A'}
                            </p>
                            <p className="mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Sales: {product.total_sold || product.sales || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No sales data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {!loading && activeTab === 'products' && (
          <div>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Add New Product</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateProduct}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Brand *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price *</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-plus"></i> Add Product
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Products List */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Products ({products.length})</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>${product.price.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td>{product.category || '-'}</td>
                          <td>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="btn btn-sm btn-info me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#editProductModal"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div className="modal fade show" id="editProductModal" style={{ display: 'block' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Product</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingProduct(null)}
                      ></button>
                    </div>
                    <form onSubmit={handleUpdateProduct}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Product Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Brand</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editingProduct.brand}
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Price</label>
                          <input
                            type="number"
                            className="form-control"
                            step="0.01"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Stock</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editingProduct.category || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingProduct(null)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Update Product
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {editingProduct && <div className="modal-backdrop fade show"></div>}
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">All Users ({users.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Type</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>
                          <span className={`badge ${user.usertype === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.usertype}
                          </span>
                        </td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <button
                            onClick={() => handleChangeUserType(user.id, user.usertype)}
                            className={`btn btn-sm ${user.usertype === 'admin' ? 'btn-warning' : 'btn-success'} me-2`}
                          >
                            {user.usertype === 'admin' ? 'Make Customer' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

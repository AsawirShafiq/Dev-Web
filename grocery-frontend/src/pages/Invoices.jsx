import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, productService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await invoiceService.getAllInvoices();
      const userInvoices = response.data.filter((inv) => inv.user_id === user?.id);
      setInvoices(userInvoices);

      // Fetch product details
      const productMap = {};
      for (const invoice of userInvoices) {
        for (const item of invoice.products) {
          if (!productMap[item.product_id]) {
            try {
              const productRes = await productService.getProduct(item.product_id);
              productMap[item.product_id] = productRes.data;
            } catch (err) {
              console.error('Failed to fetch product:', item.product_id);
            }
          }
        }
      }
      setProducts(productMap);
    } catch (err) {
      setError('Failed to load invoices. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoiceService.deleteInvoice(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      alert('Invoice deleted successfully');
    } catch (error) {
      alert('Failed to delete invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Invoices</h1>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No invoices yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to create your first invoice</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Invoice Header */}
                <button
                  onClick={() =>
                    setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)
                  }
                  className="w-full p-6 hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Invoice #{invoice.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${invoice.total_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{invoice.products.length} items</p>
                  </div>
                  <span className="ml-4 text-gray-400">
                    {expandedInvoice === invoice.id ? '▼' : '▶'}
                  </span>
                </button>

                {/* Invoice Details */}
                {expandedInvoice === invoice.id && (
                  <div className="border-t p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-4">Order Items</h4>
                    <div className="space-y-3 mb-6">
                      {invoice.products.map((item, idx) => {
                        const product = products[item.product_id];
                        return (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {product?.name || 'Product'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded p-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          $
                          {invoice.products
                            .reduce((sum, item) => sum + item.price * item.quantity, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${invoice.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Delete Invoice
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

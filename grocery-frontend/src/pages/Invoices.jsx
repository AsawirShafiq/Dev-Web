import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoiceService } from '../services/authService';

export default function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoices();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      alert('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(invoiceId);
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        alert('Invoice deleted successfully');
      } catch (error) {
        alert('Failed to delete invoice');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status"></div>
          <p className="text-muted">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="container-lg">
        <h1 className="mb-4"><i className="bi bi-file-earmark-text"></i> My Invoices</h1>

        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h2>No invoices yet</h2>
            <p>Your purchase invoices will appear here</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div>
            {invoices.map((invoice) => (
              <div key={invoice.id} className="card invoice-card mb-3">
                <div className="card-header d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }}>
                  <div onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)} className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="mb-1">Invoice #{invoice.id.slice(-8).toUpperCase()}</h5>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                          {formatDate(invoice.created_at)}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                          ${invoice.total_amount.toFixed(2)}
                        </p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                          {invoice.products?.length} item{invoice.products?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <i className={`bi bi-chevron-down ms-3 transition-transform ${expandedId === invoice.id ? 'rotate-180' : ''}`}></i>
                    </div>
                  </div>
                </div>

                {expandedId === invoice.id && (
                  <div className="card-body" style={{ borderTop: '1px solid #e5e7eb' }}>
                    {/* Items List */}
                    <div className="mb-4">
                      <h6 className="mb-3" style={{ fontWeight: 600, color: '#374151' }}>Order Items</h6>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {invoice.products?.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <div className="flex-grow-1">
                              <p className="mb-0"><strong>{item.product_name || 'Unknown Product'}</strong></p>
                              <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                Qty: {item.quantity || 0} × ${(item.price || 0).toFixed(2)}
                              </p>
                            </div>
                            <p className="mb-0" style={{ fontWeight: 500, minWidth: '80px', textAlign: 'right' }}>
                              ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{
                      backgroundColor: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>${((invoice.total_amount || 0) * 0.9).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax (10%):</span>
                        <span>${((invoice.total_amount || 0) * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between" style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#10b981',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <span>Total:</span>
                        <span>${(invoice.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate('/products')}
                        className="btn btn-primary flex-grow-1 btn-sm"
                      >
                        Continue Shopping
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Delete Invoice
                      </button>
                    </div>
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

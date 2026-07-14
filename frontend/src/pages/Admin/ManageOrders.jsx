import React, { useState, useEffect } from 'react';
import { ClipboardList, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('orders/');
      setOrders(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching admin orders list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, orderNum, newStatus) => {
    try {
      await api.patch(`orders/${orderId}/`, { status: newStatus });
      addToast(`Order ${orderNum} status updated to "${newStatus}"!`, 'success');
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      addToast('Failed to update order status.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'var(--success)';
      case 'processing': return 'var(--primary)';
      case 'shipped': return 'var(--secondary)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--warning)';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px' }}>Manage Orders</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track, update delivery status, and review user invoices.</p>
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Order ID</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Customer</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date Placed</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Grand Total</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Payment Info</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Status State</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 0', fontWeight: 600, fontFamily: 'monospace' }}>{order.order_number}</td>
                <td style={{ padding: '14px 0' }}>{order.username || 'Guest'}</td>
                <td style={{ padding: '14px 0' }}>{order.created_at.substring(0, 10)}</td>
                <td style={{ padding: '14px 0', fontWeight: 700 }}>${parseFloat(order.grand_total).toFixed(2)}</td>
                <td style={{ padding: '14px 0' }}>{order.payment_method} ({order.payment_status})</td>
                <td style={{ padding: '14px 0' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: getStatusColor(order.status),
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    textTransform: 'uppercase'
                  }}>{order.status}</span>
                </td>
                <td style={{ padding: '14px 0', textAlign: 'right' }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.order_number, e.target.value)}
                    className="form-control"
                    style={{ width: '130px', padding: '6px 10px', display: 'inline-block', fontSize: '0.85rem' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ManageOrders;

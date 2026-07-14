import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ClipboardList, Calendar, DollarSign, Package, Printer, 
  XCircle, RotateCcw, Truck, CheckCircle2, ShieldCheck, ArrowRight 
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await api.get('orders/');
      setOrders(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching orders list:', err);
      addToast('Failed to load your order history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setProcessingAction(orderId);
    try {
      await api.post(`orders/${orderId}/cancel/`);
      addToast('Order cancelled successfully. Stock has been returned.', 'success');
      await fetchOrders();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to cancel order.', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRequestRefund = async (orderId) => {
    if (!window.confirm('Are you sure you want to request a refund for this order?')) return;
    setProcessingAction(orderId);
    try {
      await api.post(`orders/${orderId}/request_refund/`);
      addToast('Refund request processed successfully. Funds will return in 3-5 business days.', 'success');
      await fetchOrders();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to request refund.', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  // Navigates to success page passing the order data so user can print/download invoice
  const handleDownloadInvoice = (order) => {
    navigate('/order-success', { state: { order } });
  };

  const getStatusBadge = (status) => {
    const configs = {
      delivered: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Delivered' },
      shipped: { color: 'text-blue-700 bg-blue-50 border-blue-200', text: 'Shipped' },
      processing: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', text: 'Processing' },
      cancelled: { color: 'text-rose-700 bg-rose-50 border-rose-200', text: 'Cancelled' },
      pending: { color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Pending Approval' }
    };
    const c = configs[status] || { color: 'text-slate-700 bg-slate-50 border-slate-200', text: status };
    return (
      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${c.color} uppercase tracking-wider`}>
        {c.text}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const isCOD = order.payment_method === 'COD';
              const canCancel = ['pending', 'processing'].includes(order.status);
              const canRefund = order.payment_status === 'paid' && order.status !== 'cancelled';
              
              // Progress tracking levels
              const progressSteps = ['pending', 'processing', 'shipped', 'delivered'];
              const currentStepIndex = progressSteps.indexOf(order.status);
              const isCancelled = order.status === 'cancelled';

              return (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 transition hover:shadow-md"
                >
                  {/* HEADER INFO */}
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Order Number</span>
                      <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{order.order_number}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
                    <div className="flex gap-2.5 items-center">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Date Placed</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Grand Total</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">INR {parseFloat(order.grand_total).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Payment Option</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.payment_method} ({order.payment_status?.toUpperCase()})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC PROGRESS BAR TRACKER */}
                  {!isCancelled && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700/80">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Status</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 capitalize">{order.status}</span>
                      </div>
                      
                      <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                        <div 
                          className="absolute h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${((currentStepIndex + 1) / progressSteps.length) * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <div className={currentStepIndex >= 0 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>Created</div>
                        <div className={currentStepIndex >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>Processed</div>
                        <div className={currentStepIndex >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>Shipped</div>
                        <div className={currentStepIndex >= 3 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>Delivered</div>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="bg-rose-50/50 dark:bg-rose-950/10 rounded-xl p-4 border border-rose-100 dark:border-rose-950 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <span>This order has been cancelled and inventories have been returned to warehouse stock.</span>
                    </div>
                  )}

                  {/* ITEMS SNAPSHOT */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.product_details?.name || 'Product Details'} <span className="text-slate-400">x {item.quantity}</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">INR {parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex justify-end gap-3 flex-wrap border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold py-2 px-4 rounded-xl text-xs transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>View Invoice</span>
                    </button>

                    {canCancel && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={processingAction === order.id}
                        className="flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/20 font-bold py-2 px-4 rounded-xl text-xs transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {canRefund && (
                      <button 
                        onClick={() => handleRequestRefund(order.id)}
                        disabled={processingAction === order.id}
                        className="flex items-center gap-1.5 border border-slate-200 text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-indigo-950/20 font-bold py-2 px-4 rounded-xl text-xs transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Request Refund</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg mx-auto">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-1">No Orders Found</h3>
            <p className="text-sm text-slate-500 mb-6">You haven't completed any e-commerce purchases yet.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-md"
            >
              <span>Visit Product Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

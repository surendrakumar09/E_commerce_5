import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowRight, Printer, XCircle, ShoppingBag, PhoneCall, RefreshCw } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  const isFailed = location.state?.failed || false;

  const handlePrint = () => {
    window.print();
  };

  // 1. Payment Failed State Presentation
  if (isFailed || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="flex justify-center mb-6 text-red-500">
            <XCircle className="w-16 h-16 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black mb-2">Payment Failed</h1>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't verify your payment transaction. Your bank account will not be charged. If the amount was deducted, it will be refunded automatically.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/checkout" 
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Payment</span>
            </Link>
            <Link 
              to="/cart" 
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold py-2.5 px-4 rounded-xl text-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Choose Another Method</span>
            </Link>
            <a 
              href="mailto:support@devstack.local" 
              className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold py-2.5 px-4 rounded-xl text-sm transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddr = order.shipping_address || {};
  const isCOD = order.payment_method === 'COD';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 text-slate-800 dark:text-slate-100 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* SUCCESS SUMMARY CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center print:hidden">
          <div className="flex justify-center mb-4 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 className="w-16 h-16 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Thank you for your purchase. Your order has been placed and is currently being processed. An invoice has been emailed to you.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-left border border-slate-100 dark:border-slate-700/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Order Number</span>
              <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{order.order_number}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
              <p className={`font-bold text-sm ${isCOD ? 'text-amber-500' : 'text-emerald-500'}`}>
                {isCOD ? 'Pending COD' : 'Paid Success'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
              <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">INR {parseFloat(order.grand_total).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-dashed border-slate-200 dark:border-slate-700 p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 dark:border-slate-700 pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 print:text-indigo-600">INVOICE RECEIPT</h2>
              <span className="text-xs text-slate-400">Order Ref: {order.order_number}</span>
            </div>
            <div className="text-right">
              <h3 className="font-extrabold text-lg">DevStack Shop</h3>
              <span className="text-xs text-slate-400">Date: {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Details metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Details</h4>
              <p className="font-bold text-slate-900 dark:text-slate-100">{shippingAddr.full_name}</p>
              <p className="text-slate-500">{shippingAddr.address_line_1}</p>
              {shippingAddr.address_line_2 && <p className="text-slate-500">{shippingAddr.address_line_2}</p>}
              <p className="text-slate-500">{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postal_code}</p>
              <p className="text-slate-500 mt-1">Phone: {shippingAddr.phone}</p>
            </div>
            <div className="sm:text-right">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Metadata</h4>
              <p className="text-slate-500"><span className="font-semibold">Payment Option:</span> {order.payment_method}</p>
              <p className="text-slate-500"><span className="font-semibold">Payment Status:</span> {order.payment_status?.toUpperCase()}</p>
              <p className="text-slate-500"><span className="font-semibold">Currency:</span> INR</p>
              <p className="text-slate-500 font-mono text-[10px] mt-1">Ref ID: {order.payments?.[0]?.razorpay_payment_id || 'COD-TXN-REF'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs mb-8">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-700 text-slate-400">
                  <th className="py-3 font-bold">Item Description</th>
                  <th className="py-3 text-center font-bold">Qty</th>
                  <th className="py-3 text-right font-bold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.product_details?.name || 'Product Details'}</p>
                      {item.variant_details && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.variant_details.size && `Size: ${item.variant_details.size}`}
                          {item.variant_details.color && ` | Color: ${item.variant_details.color}`}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-center text-slate-600 dark:text-slate-300 font-medium">{item.quantity}</td>
                    <td className="py-4 text-right font-bold text-slate-950 dark:text-white">INR {parseFloat(item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Math */}
          <div className="flex flex-col gap-2 border-t-2 border-slate-100 dark:border-slate-700 pt-6 ml-auto max-w-[280px] text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">INR {parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Discount Applied:</span>
                <span>-INR {parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Shipping Charges:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">INR {parseFloat(order.shipping_charges).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (8%):</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">INR {parseFloat(order.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-slate-200 dark:border-slate-600 pt-3 text-slate-900 dark:text-white">
              <span>Invoice Total:</span>
              <span className="text-indigo-600 dark:text-indigo-400">INR {parseFloat(order.grand_total).toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* CONTROLS */}
        <div className="flex justify-between items-center print:hidden pt-4">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-2.5 px-5 rounded-xl text-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Invoice</span>
          </button>
          <Link 
            to="/my-orders" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-md"
          >
            <span>Go to My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;

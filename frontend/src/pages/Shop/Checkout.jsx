import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Truck, Receipt, CheckCircle, MapPin, Plus, 
  Trash2, Edit, AlertCircle, ShoppingBag, Percent, ShieldCheck, QrCode, Phone 
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Checkout = () => {
  const {
    cart,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShipping,
    getTax,
    getGrandTotal,
    clearCart
  } = useCart();
  
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  
  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  // UPI Simulation State
  const [showUPISimulator, setShowUPISimulator] = useState(false);
  const [upiIntentData, setUpiIntentData] = useState(null);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('accounts/addresses/');
      const data = response.data.results || response.data || [];
      setAddresses(data);
      
      // Auto-select default or first address
      const defaultAddr = data.find(addr => addr.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr);
      else if (data.length > 0 && !selectedAddress) setSelectedAddress(data[0]);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      addToast('Could not load shipping addresses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [cart]);

  // Handle address creation/update
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      addToast('Please fill all required fields.', 'warning');
      return;
    }

    const payload = {
      address_type: 'shipping',
      full_name: fullName,
      phone,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country,
      is_default: isDefault
    };

    try {
      if (editingAddressId) {
        await api.put(`accounts/addresses/${editingAddressId}/`, payload);
        addToast('Address updated successfully!', 'success');
      } else {
        const response = await api.post('accounts/addresses/', payload);
        setSelectedAddress(response.data);
        addToast('New shipping address saved!', 'success');
      }
      resetAddressForm();
      await fetchAddresses();
    } catch (error) {
      addToast('Failed to save address. Please check input values.', 'error');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setFullName(addr.full_name);
    setPhone(addr.phone);
    setAddressLine1(addr.address_line_1);
    setAddressLine2(addr.address_line_2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setCountry(addr.country);
    setIsDefault(addr.is_default);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation(); // Avoid selecting deleted item
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`accounts/addresses/${id}/`);
      addToast('Address removed.', 'info');
      if (selectedAddress?.id === id) {
        setSelectedAddress(null);
      }
      await fetchAddresses();
    } catch (error) {
      addToast('Failed to delete address.', 'error');
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setIsDefault(false);
    setShowAddressForm(false);
  };

  // Coupon handlers
  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError('');
    const result = await applyCoupon(couponCodeInput.trim());
    if (result.success) {
      addToast(`Coupon "${couponCodeInput.toUpperCase()}" applied successfully!`, 'success');
      setCouponCodeInput('');
    } else {
      setCouponError(result.message);
      addToast(result.message, 'error');
    }
  };

  const handleRemoveCouponClick = () => {
    removeCoupon();
    addToast('Coupon code removed.', 'info');
  };

  // Dynamic Razorpay SDK Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Main Checkout Order Flow Trigger
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      addToast('Please select or add a shipping address to proceed.', 'warning');
      return;
    }

    setProcessingPayment(true);

    try {
      // CASE 1: Cash on Delivery (COD)
      if (paymentMethod === 'COD') {
        const response = await api.post('payments/cod/checkout/', {
          shipping_address: selectedAddress,
          coupon_code: coupon?.code || null
        });
        addToast('COD Order placed successfully!', 'success');
        clearCart();
        navigate('/order-success', { state: { order: response.data } });
        return;
      }

      // CASE 2: UPI Apps Intent/QR Simulation
      if (paymentMethod.startsWith('UPI_')) {
        const appName = paymentMethod.split('_')[1]; // e.g. PhonePe, GPay
        const response = await api.post('payments/upi/create/', {
          coupon_code: coupon?.code || null,
          upi_app: appName
        });
        setUpiIntentData(response.data);
        setShowUPISimulator(true);
        setProcessingPayment(false);
        return;
      }

      // CASE 3: Razorpay (Primary payment method / cards / netbanking)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        addToast('Failed to load Razorpay SDK. Check network connection.', 'error');
        setProcessingPayment(false);
        return;
      }

      // Create Razorpay Order on Backend
      const orderRes = await api.post('payments/razorpay/order/', {
        coupon_code: coupon?.code || null
      });

      const { razorpayOrderId, amount, currency, keyId, payment_id } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "DevStack Shop",
        description: `Checkout Payment for Transaction ${payment_id}`,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
        order_id: razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            addToast('Verifying signature server-side...', 'info');
            
            // Call backend verification endpoint with signatures
            const verifyRes = await api.post('payments/razorpay/verify/', {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              shipping_address: selectedAddress,
              coupon_code: coupon?.code || null,
              payment_method: 'Razorpay'
            });

            addToast('Payment verified! Order completed.', 'success');
            clearCart();
            navigate('/order-success', { state: { order: verifyRes.data } });
          } catch (verifyErr) {
            addToast(verifyErr.response?.data?.error || 'Payment verification failed.', 'error');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : "",
          email: user ? user.email : "",
          contact: user?.profile?.phone || ""
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: function () {
            addToast('Payment cancelled by customer.', 'warning');
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Checkout error:', error);
      addToast(error.response?.data?.error || 'Failed to initialize payment process.', 'error');
      setProcessingPayment(false);
    }
  };

  // Confirm simulated UPI payments
  const handleSimulateUPISuccess = async () => {
    if (!upiIntentData) return;
    setProcessingPayment(true);
    setShowUPISimulator(false);
    
    try {
      addToast('Verifying simulated UPI signature...', 'info');
      const verifyRes = await api.post('payments/upi/verify/', {
        payment_id: upiIntentData.payment_id,
        shipping_address: selectedAddress,
        coupon_code: coupon?.code || null
      });
      addToast('UPI Payment verified successfully!', 'success');
      clearCart();
      navigate('/order-success', { state: { order: verifyRes.data } });
    } catch (err) {
      addToast(err.response?.data?.error || 'UPI simulated signature validation failed.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-extrabold tracking-tight">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Address & Payment Settings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ADDRESS SECTION */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Delivery Address
                </h3>
                {!showAddressForm && (
                  <button 
                    onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                )}
              </div>

              {/* Address Form (Add/Edit) */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    {editingAddressId ? 'Edit Address' : 'New Shipping Details'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name*</label>
                      <input 
                        type="text" required value={fullName} onChange={e => setFullName(e.target.value)} 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number*</label>
                      <input 
                        type="text" required value={phone} onChange={e => setPhone(e.target.value)} 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Address Line 1*</label>
                    <input 
                      type="text" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Address Line 2 (Optional)</label>
                    <input 
                      type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">City*</label>
                      <input 
                        type="text" required value={city} onChange={e => setCity(e.target.value)} 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">State*</label>
                      <input 
                        type="text" required value={state} onChange={e => setState(e.target.value)} 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Pincode*</label>
                      <input 
                        type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" id="is_default" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} 
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_default" className="text-sm text-slate-500 cursor-pointer select-none">Set as default shipping address</label>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" onClick={resetAddressForm} 
                      className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              {addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No shipping addresses saved yet. Add a new address to continue.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`relative flex flex-col p-4 rounded-xl border-2 transition cursor-pointer select-none ${
                        selectedAddress?.id === addr.id 
                          ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-900/10' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{addr.full_name}</span>
                        {selectedAddress?.id === addr.id && (
                          <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" /> {addr.phone}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex-grow mt-1 leading-relaxed">
                        {addr.address_line_1}, {addr.address_line_2 && `${addr.address_line_2}, `}{addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      
                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700/80 pt-2.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENT METHODS SECTION */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Select Payment Method
              </h3>

              <div className="space-y-4">
                
                {/* Razorpay Option */}
                <div 
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition cursor-pointer select-none group relative overflow-hidden ${
                    paymentMethod === 'Razorpay' 
                      ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-900/10' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="paymethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={() => {}} 
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Razorpay Gateway (Cards / UPI / Netbanking)</h4>
                      <p className="text-xs text-slate-500">Pay securely using Credit Cards, Debit Cards, Netbanking, or Wallet.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded">Razorpay</span>
                  </div>
                </div>

                {/* UPI intent selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'UPI_GPay', name: 'Google Pay', desc: 'Instant UPI transfer via Google Pay app.' },
                    { id: 'UPI_PhonePe', name: 'PhonePe', desc: 'Secure UPI authorization via PhonePe app.' },
                    { id: 'UPI_Paytm', name: 'Paytm UPI', desc: 'Direct wallet link or BHIM Paytm transfer.' },
                    { id: 'UPI_BHIM', name: 'BHIM UPI', desc: 'Unified Payments Interface official app.' }
                  ].map(app => (
                    <div 
                      key={app.id}
                      onClick={() => setPaymentMethod(app.id)}
                      className={`flex items-start justify-between p-4 rounded-xl border-2 transition cursor-pointer select-none group ${
                        paymentMethod === app.id 
                          ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-900/10' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      <div className="flex gap-3">
                        <input 
                          type="radio" name="paymethod" value={app.id} checked={paymentMethod === app.id} onChange={() => {}}
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                        />
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{app.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{app.desc}</p>
                        </div>
                      </div>
                      <QrCode className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-indigo-500" />
                    </div>
                  ))}
                </div>

                {/* Cash on Delivery */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition cursor-pointer select-none group ${
                    paymentMethod === 'COD' 
                      ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-900/10' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="paymethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => {}}
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-slate-500">Pay cash upon delivery of items. (Standard service fee applies)</p>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT: Order review, Coupons & Checkout CTA */}
          <div className="space-y-6">
            
            {/* ORDER SUMMARY */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-6">
              <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">Order Summary</h3>
              
              {/* Product list */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-700">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                    <img 
                      src={item.product_details?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=80&h=80&q=80'} 
                      alt={item.product_details?.name} 
                      className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{item.product_details?.name}</h4>
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                        {item.selected_size && <span>Size: {item.selected_size.value}</span>}
                        {item.selected_color && <span>Color: {item.selected_color.value}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">INR {parseFloat(item.total_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON SECTION */}
              <div className="border-t border-slate-100 dark:border-slate-700 mt-6 pt-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Apply Promo Code</label>
                
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{coupon.code} Applied</span>
                    </div>
                    <button 
                      onClick={handleRemoveCouponClick} 
                      className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 tracking-wider hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. SAVE20, FLAT50" 
                      value={couponCodeInput} 
                      onChange={e => { setCouponCodeInput(e.target.value); setCouponError(''); }}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button 
                      type="submit" 
                      disabled={!couponCodeInput.trim()}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-1.5 text-xs font-bold rounded-lg transition disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-red-500 mt-1.5 font-medium">{couponError}</p>}
              </div>

              {/* PRICING BREAKDOWN */}
              <div className="border-t border-slate-100 dark:border-slate-700 mt-5 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">INR {getSubtotal().toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-INR {getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getShipping() === 0 ? 'FREE' : `INR ${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST / Sales Tax (8%)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">INR {getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold border-t border-slate-100 dark:border-slate-700 pt-3 text-slate-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">INR {getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* PAY CHECKOUT BUTTON */}
              <button 
                onClick={handlePlaceOrder}
                disabled={processingPayment}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl mt-6 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{processingPayment ? 'Processing Securely...' : `Pay INR ${getGrandTotal().toFixed(2)}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UPI QR PAYMENT SIMULATOR MODAL */}
      {showUPISimulator && upiIntentData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200/50 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold mb-2">Scan & Pay via UPI</h3>
            <p className="text-xs text-slate-500 mb-6">Verify code {upiIntentData.payment_id}</p>
            
            {/* Dynamic QR Code */}
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl inline-block mb-4 shadow-inner">
              <img 
                src={upiIntentData.qr_code_url} 
                alt="UPI Payment QR Code" 
                className="w-48 h-48 mx-auto object-contain rounded"
              />
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mb-2">Total Amount to Pay</p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-6">INR {parseFloat(upiIntentData.amount).toFixed(2)}</p>

            <div className="space-y-3.5">
              <a 
                href={upiIntentData.upi_uri}
                className="block w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-2 px-4 rounded-lg text-sm transition"
              >
                Open UPI App Intent
              </a>
              <button 
                onClick={handleSimulateUPISuccess}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow transition"
              >
                Simulate Payment Success
              </button>
              <button 
                onClick={() => { setShowUPISimulator(false); setUpiIntentData(null); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Ticket, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const Cart = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    coupon,
    getSubtotal,
    getDiscount,
    getShipping,
    getTax,
    getGrandTotal,
    loading
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setApplying(true);
    const res = await applyCoupon(couponCode);
    if (res.success) {
      addToast(`Coupon "${couponCode}" applied successfully! You saved ₹${res.discountAmount.toFixed(2)}.`, 'success');
      setCouponCode('');
    } else {
      addToast(res.message, 'error');
    }
    setApplying(false);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}><h2>Loading cart...</h2></div>;

  return (
    <div className="cart-page section" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '32px' }}>Shopping Cart</h1>

        {cart.items?.length > 0 ? (
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {/* Cart Items list */}
            <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    border: '1px solid var(--border)'
                  }}
                >
                  {/* Photo */}
                  <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={item.product_details?.images?.[0]?.image_url || 'https://via.placeholder.com/80'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Title & variants */}
                  <div style={{ flexGrow: 1, minWidth: '150px' }}>
                    <Link to={`/products/${item.product_details?.slug}`}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product_details?.name}</h4>
                    </Link>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.size_details && <span>Size: {item.size_details.value}</span>}
                      {item.color_details && <span>Color: {item.color_details.value}</span>}
                    </div>
                  </div>

                  {/* Quantity adjustments */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >-</button>
                    <span style={{ padding: '6px 12px', minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >+</button>
                  </div>

                  {/* Price */}
                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{parseFloat(item.total_price).toFixed(2)}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {/* Lower actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Link to="/products" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Continue Shopping</Link>
                <button onClick={clearCart} className="btn btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)', fontSize: '0.85rem' }}>Clear Cart</button>
              </div>
            </div>

            {/* Order calculations summary */}
            <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Coupon validator card */}
              <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={18} style={{ color: 'var(--primary)' }} />
                  <span>Promo Coupon</span>
                </h3>

                {coupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--success-light)',
                    color: 'var(--success)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    <span>Coupon "{coupon.code}" Active</span>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="form-control"
                      style={{ padding: '10px 14px' }}
                    />
                    <button type="submit" disabled={applying} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Apply</button>
                  </form>
                )}
              </div>

              {/* Totals card */}
              <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  {coupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                      <span>Discount</span>
                      <span>-₹{getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping Charges</span>
                    <span>{getShipping() === 0 ? 'Free' : `₹${getShipping().toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax amount (8%)</span>
                    <span>₹{getTax().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, margin: '20px 0', color: 'var(--text-primary)' }}>
                  <span>Grand Total</span>
                  <span>₹{getGrandTotal().toFixed(2)}</span>
                </div>

                <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', height: '48px', gap: '8px' }}>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <ShoppingCart size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Cart is Empty</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Fill your cart with next generation devices and trending styles.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

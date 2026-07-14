import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: 0.00 });
  const [wishlist, setWishlist] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize guest session if not present
  useEffect(() => {
    let sessionKey = localStorage.getItem('cart_session_id');
    if (!sessionKey) {
      sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart_session_id', sessionKey);
    }
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const sessionKey = localStorage.getItem('cart_session_id');
      const response = await api.get(`cart/items/`, { params: { session_id: sessionKey } });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      const response = await api.get('cart/wishlist/');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
    // Reset coupon on auth state change
    setCoupon(null);
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, sizeId = null, colorId = null) => {
    try {
      const sessionKey = localStorage.getItem('cart_session_id');
      const response = await api.post('cart/items/add/', {
        product_id: productId,
        quantity,
        size_id: sizeId,
        color_id: colorId,
        session_id: sessionKey
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to add item.' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const sessionKey = localStorage.getItem('cart_session_id');
      const response = await api.post('cart/items/update-quantity/', {
        item_id: itemId,
        quantity,
        session_id: sessionKey
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to update quantity.' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const sessionKey = localStorage.getItem('cart_session_id');
      const response = await api.post('cart/items/remove/', {
        item_id: itemId,
        session_id: sessionKey
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to remove item.' };
    }
  };

  const clearCart = async () => {
    try {
      const sessionKey = localStorage.getItem('cart_session_id');
      const response = await api.post('cart/items/clear/', { session_id: sessionKey });
      setCart(response.data);
      setCoupon(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to use wishlist.' };
    }
    const itemInWishlist = wishlist.find((item) => item.product === productId);
    if (itemInWishlist) {
      try {
        await api.delete(`cart/wishlist/${itemInWishlist.id}/`);
        setWishlist((prev) => prev.filter((item) => item.id !== itemInWishlist.id));
        return { success: true, removed: true };
      } catch (error) {
        return { success: false, message: 'Failed to modify wishlist.' };
      }
    } else {
      try {
        const response = await api.post('cart/wishlist/', { product: productId });
        setWishlist((prev) => [...prev, response.data]);
        return { success: true, added: true };
      } catch (error) {
        return { success: false, message: 'Failed to add to wishlist.' };
      }
    }
  };

  const applyCoupon = async (code) => {
    try {
      const response = await api.post('coupons/validate/', {
        code,
        subtotal: parseFloat(cart.subtotal)
      });
      setCoupon(response.data);
      return { success: true, discountAmount: response.data.discount_amount };
    } catch (error) {
      setCoupon(null);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid coupon code.'
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations for Checkout
  const getSubtotal = () => parseFloat(cart.subtotal);
  const getDiscount = () => (coupon ? parseFloat(coupon.discount_amount) : 0.00);
  const getShipping = () => (getSubtotal() > 0 && getSubtotal() - getDiscount() < 100.00 ? 10.00 : 0.00);
  const getTax = () => (getSubtotal() - getDiscount()) * 0.08;
  const getGrandTotal = () => getSubtotal() - getDiscount() + getShipping() + getTax();

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        coupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getDiscount,
        getShipping,
        getTax,
        getGrandTotal,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

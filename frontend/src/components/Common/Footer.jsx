import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('products/newsletter/', { email });
      addToast('Thank you for subscribing to our newsletter!', 'success');
      setEmail('');
    } catch (error) {
      addToast(error.response?.data?.email?.[0] || 'Subscription failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      paddingTop: '80px',
      paddingBottom: '30px',
      color: 'var(--text-secondary)',
      marginTop: 'auto'
    }}>
      <div className="container">
        {/* Upper Newsletter Section */}
        <div className="glass-card" style={{
          padding: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          marginBottom: '60px',
          marginTop: '-120px',
          position: 'relative',
          zIndex: 10,
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ flex: '1 1 400px' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Subscribe to our Newsletter</h3>
            <p style={{ fontSize: '0.95rem' }}>Stay updated with new arrivals, trending products and exclusive deals.</p>
          </div>
          <form onSubmit={handleSubscribe} style={{
            display: 'flex',
            flex: '1 1 400px',
            gap: '12px',
            maxWidth: '500px'
          }}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
              style={{ padding: '14px 18px', border: '1px solid var(--border)' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
              <Send size={16} />
              <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
            </button>
          </form>
        </div>

        {/* Mid grid layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '60px',
          paddingTop: '40px'
        }}>
          {/* Brand Info */}
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-primary)' }}>E-Commerce</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '20px' }}>
              Discover the most advanced, premium full stack shopping experience. Curated collections of the finest smart gadgets and luxury designs.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" style={{ color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" style={{ color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" style={{ color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><Link to="/">Home Page</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=smartphones">Smartphones</Link></li>
              <li><Link to="/products?category=laptops">Laptops</Link></li>
              <li><Link to="/products?category=footwear">Fashion Footwear</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>123 Innovation Street, Tech Hub, NY 10001</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>+1 (555) 234-5678</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>support@ecommerce.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower branding row */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem'
        }}>
          <span>&copy; {new Date().getFullYear()} E-Commerce Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

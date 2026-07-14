import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, ChevronDown, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, wishlist } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Scrolled effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: '#ffffff',
        padding: '6px 24px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textAlign: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1001,
        letterSpacing: '0.5px'
      }}>
        🎉 GRAND OPENING SALE: Get 20% Off on orders over $50 with code "SAVE20"! Free shipping on orders over $100.
      </div>

      <header className={`header-nav ${scrolled ? 'scrolled' : ''}`} style={{ top: '32px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo Branding */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.65rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>E-COMMERCE</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <NavLink to="/" style={({ isActive }) => ({
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
            })}>Home</NavLink>
            <NavLink to="/products" style={({ isActive }) => ({
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
            })}>Shop</NavLink>
            <NavLink to="/about" style={({ isActive }) => ({
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
            })}>About</NavLink>
            <NavLink to="/contact" style={({ isActive }) => ({
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
            })}>Contact</NavLink>
          </nav>

          {/* User & Cart Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <DarkModeToggle />

            {/* Wishlist Icon */}
            <Link to="/wishlist" style={{ position: 'relative', color: 'var(--text-primary)', padding: '6px' }}>
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>{wishlist.length}</span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" style={{ position: 'relative', color: 'var(--text-primary)', padding: '6px' }}>
              <ShoppingCart size={20} />
              {cart.total_items > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--secondary)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>{cart.total_items}</span>
              )}
            </Link>

            {/* User Dropdown Menu */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    padding: '6px 0'
                  }}
                >
                  <User size={18} />
                  <span className="desktop-only">{user?.username}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '200px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 0',
                    zIndex: 1002
                  }}>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >My Profile</Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >My Orders</Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          padding: '10px 16px',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <LayoutDashboard size={14} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '10px 16px',
                        color: 'var(--error)',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}>Log In</Link>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-only"
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '112px',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          padding: '24px',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Home</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Shop</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Contact</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;

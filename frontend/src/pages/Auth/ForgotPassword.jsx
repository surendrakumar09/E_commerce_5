import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    // Mock recovery email trigger
    setTimeout(() => {
      setSubmitted(true);
      setSending(false);
      addToast('Reset link sent successfully!', 'success');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Return login */}
      <Link to="/login" style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '0.9rem'
      }}>
        <ArrowLeft size={16} />
        <span>Return Log In</span>
      </Link>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        border: '1px solid var(--border)'
      }}>
        {!submitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Recovery</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Enter email to receive password reset links.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                    style={{ paddingLeft: '44px' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button type="submit" disabled={sending} className="btn btn-primary" style={{ width: '100%', height: '48px', gap: '8px', marginTop: '10px' }}>
                <Send size={16} />
                <span>{sending ? 'Sending Link...' : 'Send Recovery Email'}</span>
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--primary)' }}>Check Email</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '24px' }}>
              We have dispatched password recovery instructions to <strong>{email}</strong>. Please check spam folders if it does not show up.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Return Log In</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('products/contact/', { name, email, subject, message });
      addToast('Message sent successfully! We will get back to you shortly.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      addToast('Failed to submit message logs. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page section" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Contact Support</h2>
          <p className="section-subtitle">Reach out to our customer care team. We are here to help you 24/7.</p>
        </div>

        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginTop: '40px' }}>
          {/* Left: Contact Info */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Get in Touch</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Have questions regarding variants, shipping fees, custom coupon codes, or payments callbacks? Complete the contact form and our support engineers will review your log entries.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Main Headquarters</h5>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>123 Innovation Street, Tech Hub, NY 10001</span>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: '50%', color: 'var(--secondary)' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Phone Helpline</h5>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>+1 (555) 234-5678</span>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Email Address</h5>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>support@ecommerce.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Contact Form */}
          <div style={{ flex: '2 1 450px', maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '40px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Send a Message</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Message Details</label>
                  <textarea
                    rows="5"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-control"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '48px', gap: '8px' }}>
                  <Send size={16} />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

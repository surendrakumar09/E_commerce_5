import React from 'react';
import { Target, Award, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page section" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div className="section-header">
          <h2 className="section-title">Our Brand Story</h2>
          <p className="section-subtitle">Pioneering standard, premium and full stack shopping solutions.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Cover Image */}
          <div style={{
            height: '350px',
            borderRadius: 'var(--radius-md)',
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)'
          }} />

          {/* Context content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
            <p>
              Welcome to our premier E-commerce hub. Founded in 2026, we started with a simple vision: to bridge the gap between premium design aesthetics and high-performance full-stack web architectures.
            </p>
            <p>
              Every single product cataloged in our portal undergoes intensive quality verification. We collaborate directly with leading global brands such as Apple, Samsung, Sony, and Nike to present curated accessories, fashion gear, and devices that elevate your everyday lifestyle.
            </p>
          </div>

          {/* Grid Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            marginTop: '20px'
          }}>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <Users size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>50K+</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Happy Customers</span>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <Target size={32} style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>120+</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Premium Products</span>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <Award size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>24/7</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Support Hours</span>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <Heart size={32} style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>99.8%</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Positive Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

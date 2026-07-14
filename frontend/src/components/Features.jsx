import React from 'react';
import { Zap, ShieldCheck, MonitorSmartphone, Palette, Cpu, Code2 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Blazing Fast Performance',
      desc: 'Optimized page load speeds, lazy-loaded images, and lightweight scripts to provide a friction-free client browsing experience.'
    },
    {
      icon: ShieldCheck,
      title: 'Robust Security Standards',
      desc: 'Data sanitization, CSRF tokens, and secure Python middleware to lock down contact forms and newsletter subscriber databases.'
    },
    {
      icon: MonitorSmartphone,
      title: 'Responsive Mobile-First UI',
      desc: 'Fluid layouts tested across a wide array of devices including smartphones, tablets, high-res laptops, and ultrawide screens.'
    },
    {
      icon: Palette,
      title: 'State-of-the-Art Design',
      desc: 'Vibrant color systems, dark mode settings, subtle transitions, hover indicators, and premium CSS glassmorphic overlays.'
    },
    {
      icon: Cpu,
      title: 'REST API Powered Engine',
      desc: 'Clean routing separation using Django REST Framework to feed components asynchronously and scale backend storage.'
    },
    {
      icon: Code2,
      title: 'Easy System Integration',
      desc: 'Modular, commented codebases that make it straightforward to integrate third-party APIs, webhooks, or custom plugins.'
    }
  ];

  return (
    <section id="features" className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">

        <div className="section-header">
          <h2 className="section-title">Why Work With Us</h2>
          <p className="section-subtitle">We design and construct digital products with standard engineering guidelines and robust security practices.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass-card" style={{ display: 'flex', gap: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', flexShrink: 0 }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;

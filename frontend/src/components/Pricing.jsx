import React from 'react';
import { Check } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getPricing } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Pricing = () => {
  const { data: pricingPlans, loading, error } = useFetch(getPricing);

  // Fallback plans if backend API isn't initialized or running
  const fallbackPlans = [
    {
      id: 1,
      name: 'Starter',
      price: '$29',
      billing_period: 'month',
      features: ['1 Active Landing Project', 'React-powered Frontend', 'Django API Integration', 'SQLite Standard Database', 'Email Support (24hr response)'],
      is_popular: false,
      button_text: 'Get Started'
    },
    {
      id: 2,
      name: 'Professional',
      price: '$99',
      billing_period: 'month',
      features: ['5 Active Custom Projects', 'Premium Theme Configurations', 'Django + MySQL Architecture', '24/7 Priority Support', 'Custom SEO Optimizations', 'Bi-weekly Security Audits'],
      is_popular: true,
      button_text: 'Go Professional'
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$249',
      billing_period: 'month',
      features: ['Unlimited Projects', 'Custom UI Component System', 'Full REST API Access', 'Dedicated Solutions Engineer', 'Advanced Analytics Tools', '99.9% Server SLA'],
      is_popular: false,
      button_text: 'Contact Sales'
    }
  ];

  const displayedPlans = pricingPlans && pricingPlans.length > 0 ? pricingPlans : fallbackPlans;

  return (
    <section id="pricing" className="section">
      <div className="container">

        <div className="section-header">
          <h2 className="section-title">Pricing Plans</h2>
          <p className="section-subtitle">Select the package that fits your stage of business. Transparent pricing, no hidden contract fees.</p>
        </div>

        {loading && !pricingPlans ? (
          <LoadingSpinner />
        ) : error && !pricingPlans ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '20px' }}>Connecting to pricing API failed, displaying standard packages...</p>
            <PricingGrid items={fallbackPlans} />
          </div>
        ) : (
          <PricingGrid items={displayedPlans} />
        )}

      </div>
    </section>
  );
};

const PricingGrid = ({ items }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'stretch' }} className="pricing-grid">
      {items.map((plan) => (
        <div 
          key={plan.id} 
          className={`glass-card ${plan.is_popular ? 'popular' : ''}`} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '40px 30px',
            position: 'relative',
            border: plan.is_popular ? '2px solid var(--primary)' : '1px solid var(--border)',
            boxShadow: plan.is_popular ? 'var(--shadow-glow)' : 'var(--glass-shadow)',
          }}
        >
          {/* Most Popular Label Badge */}
          {plan.is_popular && (
            <span style={{ 
              position: 'absolute', 
              top: '-14px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              backgroundColor: 'var(--primary)', 
              color: '#ffffff', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              padding: '4px 16px', 
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Most Popular
            </span>
          )}

          {/* Plan Header */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {plan.price}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                /{plan.billing_period}
              </span>
            </div>
          </div>

          {/* Features Checklist */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flexGrow: 1 }}>
            {plan.features.map((feature, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary-light)', 
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Subscription Button */}
          <button 
            className={`btn ${plan.is_popular ? 'btn-primary glow-btn' : 'btn-secondary'}`}
            style={{ width: '100%', py: '14px', py: '14px', py: '14px' }}
          >
            {plan.button_text}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Pricing;

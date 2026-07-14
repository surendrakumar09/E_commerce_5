import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getTestimonials } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Testimonials = () => {
  const { data: testimonials, loading, error } = useFetch(getTestimonials);

  // Fallback mock testimonials
  const fallbackTestimonials = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      designation: 'CTO, CloudScale',
      review: 'The development team exceeded all our expectations. They delivered a highly secure Django backend coupled with a stunningly polished React frontend. Highly recommended!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 2,
      name: 'Michael Chen',
      designation: 'Product Lead, InnovateInc',
      review: 'Their attention to responsive styling and micro-animations made our landing page feel premium and incredibly engaging. Excellent work!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 3,
      name: 'Amanda Ross',
      designation: 'Founder, BloomCreative',
      review: 'From initial wireframes to the final Django MySQL database setup, the execution was flawless. We saw customer contacts rise within days of launching the new site.',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
    }
  ];

  const displayedTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section id="testimonials" className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">

        <div className="section-header">
          <h2 className="section-title">Client Testimonials</h2>
          <p className="section-subtitle">Read feedback from our partners, enterprise product leads, and business founders.</p>
        </div>

        {loading && !testimonials ? (
          <LoadingSpinner />
        ) : error && !testimonials ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '20px' }}>Loading reviews from API failed, displaying offline testimonials...</p>
            <TestimonialsGrid items={fallbackTestimonials} />
          </div>
        ) : (
          <TestimonialsGrid items={displayedTestimonials} />
        )}

      </div>
    </section>
  );
};

const TestimonialsGrid = ({ items }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      {items.map((t) => (
        <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', minHeight: '280px' }}>
          
          {/* Quote Icon Overlay */}
          <div style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--primary-light)', opacity: 0.7 }}>
            <Quote size={40} />
          </div>

          {/* Stars Rating Row */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                size={18} 
                fill={idx < t.rating ? 'var(--warning)' : 'none'} 
                color={idx < t.rating ? 'var(--warning)' : 'var(--text-muted)'} 
              />
            ))}
          </div>

          {/* Feedback Text */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.6, fontStyle: 'italic', flexGrow: 1 }}>
            "{t.review}"
          </p>

          {/* Customer Avatar & Bio Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <img 
              src={t.image} 
              alt={t.name} 
              loading="lazy"
              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.designation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;

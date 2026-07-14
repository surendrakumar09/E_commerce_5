import React from 'react';
import * as Icons from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getServices } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Services = () => {
  const { data: services, loading, error } = useFetch(getServices);

  // Fallback services in case API is offline or database is empty
  const fallbackServices = [
    { id: 1, icon: 'Layout', title: 'UI/UX Design', description: 'Crafting beautiful, user-centered interfaces that captivate and engage. We focus on modern layouts, interactive design systems, and user journey optimization.' },
    { id: 2, icon: 'Globe', title: 'Frontend Development', description: 'Building blazing-fast, responsive web interfaces using React.js, modern CSS layout structures, global state management, and lightweight animations.' },
    { id: 3, icon: 'Server', title: 'Backend Engineering', description: 'Architecting secure, scalable APIs and backend systems using Python, Django, Django REST Framework, and optimized MySQL query handling.' },
    { id: 4, icon: 'Cloud', title: 'DevOps & Cloud', description: 'Deploying and managing automated CI/CD pipelines, containerized environments, cloud architecture (AWS/GCP), and secure server environments.' },
    { id: 5, icon: 'Shield', title: 'Cybersecurity Services', description: 'Securing your applications with robust JWT/OAuth authentication, data encryption, active penetration testing, and regular vulnerability audits.' },
    { id: 6, icon: 'Activity', title: 'Analytics & SEO', description: 'Integrating custom analytics dashboards, speed optimizations, structured micro-data schemas, and SEO configurations for high visibility.' }
  ];

  const displayedServices = services && services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="section" style={{ position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">We deliver premium full stack development services tailored to accelerate your business growth.</p>
        </div>

        {loading && !services ? (
          <LoadingSpinner />
        ) : error && !services ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '20px' }}>Loading services from API failed, displaying built-in fallback solutions...</p>
            <ServicesGrid items={fallbackServices} />
          </div>
        ) : (
          <ServicesGrid items={displayedServices} />
        )}

      </div>
    </section>
  );
};

const ServicesGrid = ({ items }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      {items.map((service) => {
        // Dynamically resolve icon from lucide-react package
        const LucideIcon = Icons[service.icon] || Icons.HelpCircle;
        
        return (
          <div key={service.id} className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing Accent Top Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <LucideIcon size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>{service.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{service.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Services;

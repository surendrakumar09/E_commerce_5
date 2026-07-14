import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getProjects } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Portfolio = () => {
  const { data: projects, loading, error } = useFetch(getProjects);

  // Fallback mock projects in case API is offline
  const fallbackProjects = [
    {
      id: 1,
      title: 'Apex E-Commerce',
      category: 'Full Stack Dev',
      description: 'A high-performance headless e-commerce store utilizing Django REST Framework and React, complete with secure payment gateways and a fully responsive checkout portal.',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
      live_demo_url: 'http://localhost:5173',
      github_url: 'https://github.com'
    },
    {
      id: 2,
      title: 'Quantum FinTech Analytics',
      category: 'Frontend UI/UX',
      description: 'A dark-mode financial intelligence suite with animated dashboard charts, real-time investment summaries, and interactive balance planning layouts.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      live_demo_url: 'http://localhost:5173',
      github_url: 'https://github.com'
    },
    {
      id: 3,
      title: 'Nova Container Orchestrator',
      category: 'DevOps / Systems',
      description: 'A cloud administration control panel designed to monitor microservices container clusters, logs aggregation pipelines, and active load balancer performance.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      live_demo_url: 'http://localhost:5173',
      github_url: 'https://github.com'
    }
  ];

  const displayedProjects = projects && projects.length > 0 ? projects : fallbackProjects;

  return (
    <section id="portfolio" className="section">
      <div className="container">
        
        <div className="section-header">
          <h2 className="section-title">Our Portfolio</h2>
          <p className="section-subtitle">A collection of custom applications, high-performance backends, and responsive UI/UX dashboards.</p>
        </div>

        {loading && !projects ? (
          <LoadingSpinner />
        ) : error && !projects ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '20px' }}>Connecting to portfolio API failed, showing offline mockup case studies...</p>
            <PortfolioGrid items={fallbackProjects} />
          </div>
        ) : (
          <PortfolioGrid items={displayedProjects} />
        )}

      </div>
    </section>
  );
};

const PortfolioGrid = ({ items }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }} className="portfolio-grid">
      {items.map((project) => (
        <div key={project.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Zooming Image Wrapper */}
          <div className="img-container" style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src={project.image} 
              alt={project.title} 
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
              className="portfolio-img"
            />
            {/* Category Overlay Badge */}
            <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '50px', boxShadow: 'var(--shadow-sm)' }}>
              {project.category}
            </span>
          </div>

          {/* Details Body */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>{project.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
              {project.description}
            </p>
            
            {/* Controls Bar */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
              <a 
                href={project.live_demo_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ flex: 1, gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                Live Demo <ExternalLink size={16} />
              </a>
              <a 
                href={project.github_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ gap: '8px', padding: '10px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                title="View Source on GitHub"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .portfolio-grid .glass-card:hover .portfolio-img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
};

export default Portfolio;

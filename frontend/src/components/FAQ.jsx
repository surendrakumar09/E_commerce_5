import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'What is the full stack technology layout of this application?',
      answer: 'The application uses React.js (Vite configuration) on the frontend for speed and single-page routing, and Python Django REST Framework on the backend for clean database schemas and REST API view endpoints. MySQL acts as the production database.'
    },
    {
      question: 'How does the automatic database verification work?',
      answer: 'When the backend Django server boots up, its setting adapter validates the database connection string. If it cannot find the MySQL database, it attempts to dynamically create it. If MySQL is entirely offline, it gracefully boots using an SQLite file database.'
    },
    {
      question: 'Can I add/modify services and projects dynamically?',
      answer: 'Yes! The application includes a custom-configured Django Admin Panel site dashboard. After logging in (admin accounts are seedable), you can easily add, update, or remove services, portfolio items, testimonials, and plan metrics.'
    },
    {
      question: 'Are there form notifications and visual indicators?',
      answer: 'Absolutely. The contact forms and newsletter modules are wired up to return detailed state callbacks (loading spinners and green/red/blue toast notifications) indicating subscription successes or specific validation errors.'
    },
    {
      question: 'Is this layout mobile responsive?',
      answer: 'Yes. The structure utilizes flex grid rules, responsive CSS breakpoints, viewport sizing controls, and mobile Hamburger menus to guarantee smooth displays across desktop monitors, tablet dimensions, and mobile viewports.'
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Here are answers to some of the most common questions regarding our stack and capabilities.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div key={index} className="glass-card faq-item-card" style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => toggleFAQ(index)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {faq.question}
                  </h3>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                <div 
                  className={`faq-answer ${isOpen ? 'open' : ''}`}
                  style={{ 
                    maxHeight: isOpen ? '200px' : '0px', 
                    overflow: 'hidden', 
                    transition: 'all 0.3s ease-in-out',
                    opacity: isOpen ? 1 : 0,
                    marginTop: isOpen ? '12px' : '0px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;

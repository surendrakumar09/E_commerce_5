import React from 'react';
import { ArrowRight, Sparkles, Terminal, Cpu } from 'lucide-react';

const Hero = () => {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="section hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '120px', background: 'radial-gradient(circle at 10% 20%, var(--primary-light) 0%, transparent 40%), radial-gradient(circle at 90% 80%, var(--secondary-light) 0%, transparent 40%)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
        
        {/* Left Side: Call to Action */}
        <div style={{ animation: 'fadeInUp 1s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '24px' }}>
            <Sparkles size={14} />
            <span>Next-Gen Full Stack Solutions</span>
          </div>
          
          <h1 style={{ fontSize: '3.8rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '24px', lineHeight: 1.15 }}>
            Scale Your Business With <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Python & React</span>
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '580px', lineHeight: 1.7 }}>
            Build responsive, cloud-native apps with Django and React. Empowering brands with secure APIs, custom database architectures, and exceptional interfaces.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => handleScrollTo('contact')} className="btn btn-primary glow-btn" style={{ gap: '8px' }}>
              Launch Your Project <ArrowRight size={18} />
            </button>
            <button onClick={() => handleScrollTo('portfolio')} className="btn btn-secondary">
              View Case Studies
            </button>
          </div>
        </div>

        {/* Right Side: Floating Illustration */}
        <div className="hero-graphic" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeInUp 1.2s ease-out' }}>
          
          {/* Main Visual Code Block */}
          <div className="glass-card animate-float" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative', zIndex: 2, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'monospace' }}>app.py</span>
            </div>
            
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto', color: 'var(--text-secondary)' }}>
              <code>
<span style={{ color: '#ec4899' }}>from</span> django.db <span style={{ color: '#ec4899' }}>import</span> models<br/>
<br/>
<span style={{ color: '#3b82f6' }}>class</span> <span style={{ color: 'var(--primary)' }}>Project</span>(models.Model):<br/>
&nbsp;&nbsp;&nbsp;&nbsp;title = models.CharField(max_length=200)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;api_powered = models.BooleanField(default=True)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;react_ui = models.BooleanField(default=True)<br/>
<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#10b981' }}>def</span> <span style={{ color: 'var(--secondary)' }}>is_production_ready</span>(self):<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return self.react_ui and self.api_powered
              </code>
            </pre>
          </div>

          {/* Styled Glowing Orbs in Background */}
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15, zIndex: 1 }}></div>
          <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.15, zIndex: 1 }}></div>

          {/* Floating UI Badges */}
          <div className="badge-float" style={{ position: 'absolute', top: '10%', right: '-10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)', zIndex: 3, animation: 'float 5s ease-in-out infinite alternate' }}>
            <Cpu style={{ color: 'var(--secondary)' }} size={20} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response Latency</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>12ms (DRF API)</span>
            </div>
          </div>

          <div className="badge-float" style={{ position: 'absolute', bottom: '15%', left: '-20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)', zIndex: 3, animation: 'float 7s ease-in-out infinite alternate-reverse' }}>
            <Terminal style={{ color: 'var(--primary)' }} size={20} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frontend Framework</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>React 18 / SPA</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 991px) {
          .hero-section .container {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: 60px !important;
          }
          .hero-section h1 {
            font-size: 2.8rem !important;
          }
          .hero-section div {
            align-items: center;
            justify-content: center;
          }
          .hero-section p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-graphic {
            max-width: 450px;
            margin: 0 auto;
            width: 100%;
          }
          .badge-float {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;

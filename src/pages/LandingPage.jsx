import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const pageRef = useScrollReveal();

  return (
    <div className="landing" ref={pageRef}>
      <div className="landing-bg" />

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-shield-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="landing-title">SKINSHIELD PRO</h1>
        <span className="landing-crm">CRM</span>
        <p className="landing-tagline">Your gym outreach command center</p>
        <div className="landing-hero-actions">
          <Link to="/login" className="landing-btn landing-btn-primary">Sign In</Link>
          <a href="#features" className="landing-btn landing-btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <h2 className="landing-section-title reveal">Everything you need to close more gyms</h2>
        <div className="landing-feature-grid">
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h18" /><path d="M3 15h18" />
              </svg>
            </div>
            <h3>Pipeline Management</h3>
            <p>Track every lead from first call to signed customer with a drag-and-drop kanban board.</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3>Contact Database</h3>
            <p>Search and filter thousands of gym contacts. Instant lookups by name, city, or stage.</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>CSV Import</h3>
            <p>Bulk import leads straight from the scraper. Map columns, preview data, and go.</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3>Activity Tracking</h3>
            <p>Log every call, email, and note. Full history on every contact so nothing slips through.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <h2 className="landing-section-title reveal">Built for the SkinShieldPro team</h2>
        <div className="landing-stats-grid">
          <div className="landing-stat reveal">
            <span className="landing-stat-number">1,600+</span>
            <span className="landing-stat-label">US cities covered</span>
          </div>
          <div className="landing-stat reveal">
            <span className="landing-stat-number">6</span>
            <span className="landing-stat-label">Pipeline stages</span>
          </div>
          <div className="landing-stat reveal">
            <span className="landing-stat-number">100%</span>
            <span className="landing-stat-label">Activity history</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>SkinShieldPro CRM</span>
        </div>
        <a href="https://skinshieldpro.com" target="_blank" rel="noopener noreferrer" className="landing-footer-link">
          skinshieldpro.com
        </a>
      </footer>
    </div>
  );
}

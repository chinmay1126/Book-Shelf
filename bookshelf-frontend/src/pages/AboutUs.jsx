import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

export default function AboutUs() {
  /* Force light mode on this page */
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'light');
    return () => {
      if (prev) root.setAttribute('data-theme', prev);
      else root.removeAttribute('data-theme');
    };
  }, []);

  return (
    <div className="about-page" data-force-light>
      {/* ── Mini Navbar ── */}
      <header className="about-nav">
        <div className="about-nav__inner">
          <Link to="/" className="about-nav__brand">
            <span className="about-nav__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            BookShelf
          </Link>
          <Link to="/" className="about-nav__back">← Back to Store</Link>
        </div>
      </header>

      {/* ── Hero section ── */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="about-hero__eyebrow">Our Story</p>
          <h1 className="about-hero__title">
            We believe reading<br />should feel <em>personal</em>.
          </h1>
          <p className="about-hero__sub">
            BookShelf started as a weekend project by a handful of book lovers frustrated with
            algorithmic noise. We wanted a calm place where titles speak for themselves —
            no recommendations engines, no "customers also bought" funnels. Just spines on a shelf.
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="about-stats">
        <div className="about-stats__inner">
          {[
            { number: '2,400+', label: 'Curated Titles' },
            { number: '5K', label: 'Happy Readers' },
            { number: '48', label: 'Genres Covered' },
            { number: '12', label: 'Countries Shipped' },
          ].map((s) => (
            <div className="about-stats__item" key={s.label}>
              <span className="about-stats__number">{s.number}</span>
              <span className="about-stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values section ── */}
      <section className="about-values">
        <div className="about-values__inner">
          <h2 className="about-section-title">What We Stand For</h2>
          <div className="about-values__grid">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ),
                title: 'Honest Curation',
                desc: 'Every book on BookShelf is hand-picked. No pay-to-play placements, no hidden sponsorships — just titles we genuinely believe in.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'Reader Privacy',
                desc: 'We don\'t track your reading habits to sell ads. Your shelf, your business. Zero behavioural profiling, zero data brokering.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: 'Community First',
                desc: 'We host monthly reading circles, author Q&As, and seasonal spotlights. BookShelf is as much a community as it is a store.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                title: 'Indie Support',
                desc: 'A portion of every sale goes directly to independent publishers. We champion the small presses that nurture bold, original voices.',
              },
            ].map((v) => (
              <div className="about-values__card" key={v.title}>
                <div className="about-values__card-icon">{v.icon}</div>
                <h3 className="about-values__card-title">{v.title}</h3>
                <p className="about-values__card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team section ── */}
      <section className="about-team">
        <div className="about-team__inner">
          <h2 className="about-section-title">The People Behind the Shelf</h2>
          <p className="about-team__intro">
            A small crew of readers, designers, and developers who'd rather browse a bookstore
            than scroll a feed.
          </p>
          <div className="about-team__grid">
            {[
              { name: 'Chinmay Munj', role: 'Founder & Lead Developer', initials: 'CK', color: '#B85C2C' },
            ].map((m) => (
              <div className="about-team__member" key={m.name}>
                <div className="about-team__avatar" style={{ background: m.color }}>
                  {m.initials}
                </div>
                <h4 className="about-team__name">{m.name}</h4>
                <p className="about-team__role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="about-timeline">
        <div className="about-timeline__inner">
          <h2 className="about-section-title">Our Journey</h2>
          <div className="about-timeline__track">
            {[
              { year: '2024', event: 'Launched reading circles & monthly author Q&A sessions.' },
              { year: '2025', event: 'Reached 5k happy readers and 48 genre categories.' },
            ].map((t, i) => (
              <div className="about-timeline__item" key={t.year} style={{ '--delay': `${i * 0.12}s` }}>
                <div className="about-timeline__dot" />
                <div className="about-timeline__content">
                  <span className="about-timeline__year">{t.year}</span>
                  <p className="about-timeline__event">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="about-cta">
        <div className="about-cta__inner">
          <h2 className="about-cta__title">Ready to find your next great read?</h2>
          <p className="about-cta__sub">
            Browse our curated catalog — no algorithms, no noise. Just great books.
          </p>
          <Link to="/" className="about-cta__btn">Browse the Catalog →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="about-footer">
        <div className="about-footer__inner">
          <p>© {new Date().getFullYear()} BookShelf. All rights reserved.</p>
          <Link to="/">Back to Store</Link>
        </div>
      </footer>
    </div>
  );
}

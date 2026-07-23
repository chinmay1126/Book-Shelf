import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ cartCount, onCartClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="nav-wrapper">
      <header className="nav">
        <div className="nav__inner">
          {/* Brand — book icon visible on desktop, hidden on mobile */}
          <a href="/" className="nav__brand">
            <span className="nav__book-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            BookShelf
          </a>

          {/* Desktop nav links */}
          <nav className="nav__links">
            <a href="#shelf">The Shelf</a>
            <a href="#catalog">Browse</a>
            <Link to="/about">About</Link>
          </nav>

          {/* Desktop actions */}
          <div className="nav__actions">
            <input className="nav__search" type="search" placeholder="Search titles, authors…" />
            <button className="nav__cart" onClick={onCartClick} aria-label="Open cart">
              Cart
              <span className="nav__cart-count">{cartCount}</span>
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav__hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="nav__mobile-menu">
            <a href="#shelf" onClick={() => setMobileOpen(false)}>The Shelf</a>
            <a href="#catalog" onClick={() => setMobileOpen(false)}>Browse</a>
            <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
            <input className="nav__search nav__search--mobile" type="search" placeholder="Search titles, authors…" />
          </div>
        )}
      </header>
    </div>
  );
}

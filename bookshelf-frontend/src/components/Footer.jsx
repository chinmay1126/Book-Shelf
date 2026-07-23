import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="footer__inner">

        {/* ── Left: Brand block ── */}
        <div className="footer__brand-block">
          <a href="/" className="footer__logo">
            <span className="footer__logo-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            BookShelf
          </a>
          <p className="footer__desc">
            A small, honest storefront for people who read. No algorithms, no noise —
            just great books waiting to be discovered.
          </p>
        </div>

        {/* ── Right: Link columns ── */}
        <div className="footer__columns">

          {/* Column 0 — Discover */}
          <div className="footer__col">
            <h4 className="footer__col-title">Discover</h4>
            <ul className="footer__col-links">
              <li><a href="#catalog">New Arrivals</a></li>
              <li><a href="#catalog">Best Sellers</a></li>
              <li><a href="#catalog">Reading Lists</a></li>
              <li><a href="#catalog">Gift Cards</a></li>
            </ul>
          </div>

          {/* Column 1 — Trending Genres */}
          <div className="footer__col">
            <h4 className="footer__col-title">Trending Genres</h4>
            <ul className="footer__col-links">
              <li><a href="#catalog">Literary Fiction</a></li>
              <li><a href="#catalog">Dark Fantasy</a></li>
              <li><a href="#catalog">Historical Noir</a></li>
            </ul>
          </div>

          {/* Column 2 — Pages */}
          <div className="footer__col">
            <h4 className="footer__col-title">Pages</h4>
            <ul className="footer__col-links">
              <li><Link to="/about">About</Link></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3 — Access */}
          <div className="footer__col">
            <h4 className="footer__col-title">Access</h4>
            <ul className="footer__col-links">
              <li><a href="#login">Login</a></li>
              <li><a href="#signup">Sign Up</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__copy">© {new Date().getFullYear()} BookShelf. All rights reserved.</p>
        <p className="footer__built">Built with React &amp; Node</p>
      </div>
    </footer>
  );
}

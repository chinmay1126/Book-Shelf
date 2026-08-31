import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import './Navbar.css';

/**
 * Sections that live on the home page rather than at a route of their own.
 */
const HOME_SECTIONS = [
  { hash: '#shelf', labelKey: null, fallback: 'The Shelf' },
  { hash: '#catalog', labelKey: 'navbar.catalog', fallback: 'Browse' },
];

/** Routes shown to everyone. */
const PUBLIC_LINKS = [
  { to: '/wishlist', labelKey: 'navbar.wishlist', fallback: 'Wishlist' },
  { to: '/book-clubs', labelKey: null, fallback: '👥 Book Clubs' },
  { to: '/orders', labelKey: 'navbar.orders', fallback: 'Orders' },
  { to: '/about', labelKey: 'navbar.about', fallback: 'About' },
];

/**
 * Total books in the cart.
 */
export function cartItemCount(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce((total, item) => {
    const quantity = Number(item?.quantity);
    return Number.isFinite(quantity) && quantity > 0 ? total + quantity : total;
  }, 0);
}

function MenuIcon({ open }) {
  return open ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Navbar({ searchQuery, setSearchQuery }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuth() ?? {};
  const { isAuthenticated = false, user = null, logout } = auth;

  const itemCount = useMemo(() => cartItemCount(cart), [cart]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    let frame = 0;

    const scrollToTarget = () => {
      const target = document.querySelector(location.hash);
      if (!target) {
        return;
      }

      const prefersReducedMotion = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      )?.matches;

      if (typeof target.scrollIntoView !== 'function') {
        return;
      }

      try {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      } catch {
        // Safe scroll fallback
      }
    };

    frame = window.requestAnimationFrame(scrollToTarget);

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, location.key]);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setMobileOpen(false);
  }, [setIsCartOpen]);

  const handleLogout = useCallback(async () => {
    setMobileOpen(false);

    try {
      await logout?.();
    } catch (error) {
      console.error('[navbar] logout failed:', error);
    }

    navigate('/');
  }, [logout, navigate]);

  const label = (key, fallback) => (key ? t(key) || fallback : fallback);

  const isAdmin = user?.role === 'admin';

  const accountLinks = isAuthenticated
    ? [
        { to: '/profile', label: t('navbar.profile') || 'Profile' },
        { to: '/account/orders', label: 'My orders' },
        { to: '/collections', label: '📚 My collections' },
        ...(isAdmin
          ? [
              { to: '/admin', label: '📊 Admin Dashboard' },
              { to: '/admin/inventory', label: '🛠️ Admin Inventory' },
            ]
          : []),
        { to: '/design-system', label: '🎨 Design System' },
      ]
    : [{ to: '/design-system', label: '🎨 Design System' }];

  const cartLabel = t('navbar.cart') || 'Cart';
  const cartAriaLabel =
    itemCount === 0
      ? 'Open cart, empty'
      : `Open cart, ${itemCount} ${itemCount === 1 ? 'book' : 'books'}`;

  return (
    <div className="nav-wrapper">
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__brand">
            <span className="nav__book-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            {t('navbar.logo') || 'BookShelf'}
          </Link>

          <nav className="nav__links" aria-label="Main">
            {HOME_SECTIONS.map((section) => (
              <Link key={section.hash} to={`/${section.hash}`}>
                {label(section.labelKey, section.fallback)}
              </Link>
            ))}

            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {label(link.labelKey, link.fallback)}
              </NavLink>
            ))}

            {accountLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button type="button" className="nav__logout" onClick={handleLogout}>
                {user?.name ? `${t('navbar.logout') || 'Log out'} (${user.name})` : t('navbar.logout') || 'Log out'}
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {t('navbar.login') || 'Login'}
              </NavLink>
            )}
          </nav>

          <div className="nav__actions">
            <input
              className="nav__search"
              type="search"
              placeholder={t('navbar.searchPlaceholder') || 'Search titles, authors...'}
              value={searchQuery || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery?.(val);
                if (location.pathname !== '/' && val.trim()) {
                  navigate(`/?search=${encodeURIComponent(val.trim())}`);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && location.pathname !== '/') {
                  navigate(`/?search=${encodeURIComponent(searchQuery || '')}`);
                }
              }}
              aria-label={t('navbar.searchPlaceholder') || 'Search titles, authors'}
            />

            {isAuthenticated && <NotificationDropdown />}

            <LanguageSwitcher />

            <ThemeToggle variant="inline" className="nav__theme-toggle" />

            <button className="nav__cart" onClick={openCart} aria-label={cartAriaLabel}>
              {cartLabel}
              {itemCount > 0 && (
                <span className="nav__cart-count" data-testid="cart-count">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          <button
            className="nav__hamburger"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>

        {mobileOpen && (
          <div className="nav__mobile-menu">
            {HOME_SECTIONS.map((section) => (
              <Link
                key={section.hash}
                to={`/${section.hash}`}
                onClick={closeMobileMenu}
              >
                {label(section.labelKey, section.fallback)}
              </Link>
            ))}

            {PUBLIC_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={closeMobileMenu}>
                {label(link.labelKey, link.fallback)}
              </Link>
            ))}

            {accountLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={closeMobileMenu}>
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                className="nav__logout nav__logout--mobile"
                onClick={handleLogout}
              >
                Log out
              </button>
            ) : (
              <Link to="/login" onClick={closeMobileMenu}>
                Login
              </Link>
            )}

            <input
              className="nav__search nav__search--mobile"
              type="search"
              placeholder={t('navbar.searchPlaceholder') || 'Search titles, authors...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('navbar.searchPlaceholder') || 'Search titles, authors'}
            />

            <button className="nav__mobile-cart-btn" onClick={openCart}>
              {cartLabel}
              {itemCount > 0 ? ` (${itemCount})` : ''}
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

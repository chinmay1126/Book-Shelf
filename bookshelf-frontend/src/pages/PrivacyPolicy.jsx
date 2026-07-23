import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  /* Force light mode on this page */
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'light');
    window.scrollTo(0, 0);
    return () => {
      if (prev) root.setAttribute('data-theme', prev);
      else root.removeAttribute('data-theme');
    };
  }, []);

  const lastUpdated = 'July 24, 2025';

  return (
    <div className="privacy-page" data-force-light>
      {/* ── Mini Navbar ── */}
      <header className="privacy-nav">
        <div className="privacy-nav__inner">
          <Link to="/" className="privacy-nav__brand">
            <span className="privacy-nav__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            BookShelf
          </Link>
          <Link to="/" className="privacy-nav__back">← Back to Store</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="privacy-hero">
        <div className="privacy-hero__inner">
          <p className="privacy-hero__eyebrow">Legal</p>
          <h1 className="privacy-hero__title">Privacy Policy</h1>
          <p className="privacy-hero__updated">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* ── Content ── */}
      <article className="privacy-content">
        <div className="privacy-content__inner">

          {/* Table of Contents */}
          <nav className="privacy-toc">
            <h2 className="privacy-toc__title">Contents</h2>
            <ol className="privacy-toc__list">
              <li><a href="#info-collect">Information We Collect</a></li>
              <li><a href="#info-use">How We Use Your Information</a></li>
              <li><a href="#info-share">Information Sharing</a></li>
              <li><a href="#cookies">Cookies &amp; Tracking</a></li>
              <li><a href="#data-security">Data Security</a></li>
              <li><a href="#data-retention">Data Retention</a></li>
              <li><a href="#your-rights">Your Rights</a></li>
              <li><a href="#children">Children's Privacy</a></li>
              <li><a href="#changes">Changes to This Policy</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ol>
          </nav>

          {/* Sections */}
          <div className="privacy-sections">

            <section className="privacy-section" id="info-collect">
              <div className="privacy-section__number">01</div>
              <h2 className="privacy-section__title">Information We Collect</h2>
              <p>We collect information you provide directly when using BookShelf:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                <li><strong>Order Details:</strong> Shipping address, billing information, and purchase history when you buy books.</li>
                <li><strong>Profile Data:</strong> Reading preferences, wishlists, and reviews you choose to share.</li>
                <li><strong>Communications:</strong> Messages you send through our contact form or customer support.</li>
              </ul>
              <p>We also automatically collect certain technical data:</p>
              <ul>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>IP address and general location (city-level)</li>
                <li>Pages visited and time spent on BookShelf</li>
              </ul>
            </section>

            <section className="privacy-section" id="info-use">
              <div className="privacy-section__number">02</div>
              <h2 className="privacy-section__title">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your book orders</li>
                <li>Manage your account and provide customer support</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Improve our catalog and user experience</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
              <div className="privacy-callout">
                <div className="privacy-callout__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p><strong>Our promise:</strong> We never use your reading habits or purchase history to build behavioural profiles for advertising. Your reading life is private.</p>
              </div>
            </section>

            <section className="privacy-section" id="info-share">
              <div className="privacy-section__number">03</div>
              <h2 className="privacy-section__title">Information Sharing</h2>
              <p>We do not sell your personal data. We share information only in these limited cases:</p>
              <ul>
                <li><strong>Payment Processors:</strong> To securely process your transactions (e.g., Stripe, Razorpay).</li>
                <li><strong>Shipping Partners:</strong> To deliver your orders to the correct address.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with prior notice).</li>
              </ul>
            </section>

            <section className="privacy-section" id="cookies">
              <div className="privacy-section__number">04</div>
              <h2 className="privacy-section__title">Cookies &amp; Tracking</h2>
              <p>BookShelf uses minimal cookies to function properly:</p>
              <div className="privacy-table-wrap">
                <table className="privacy-table">
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>session_id</code></td>
                      <td>Keeps you logged in</td>
                      <td>Session</td>
                    </tr>
                    <tr>
                      <td><code>cart_data</code></td>
                      <td>Remembers your cart items</td>
                      <td>7 days</td>
                    </tr>
                    <tr>
                      <td><code>theme_pref</code></td>
                      <td>Stores your light/dark preference</td>
                      <td>1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>We do <strong>not</strong> use third-party tracking cookies, analytics scripts, or advertising pixels.</p>
            </section>

            <section className="privacy-section" id="data-security">
              <div className="privacy-section__number">05</div>
              <h2 className="privacy-section__title">Data Security</h2>
              <p>We take reasonable measures to protect your personal information:</p>
              <ul>
                <li>All data transmitted to and from BookShelf is encrypted via TLS/SSL.</li>
                <li>Passwords are hashed using industry-standard algorithms (bcrypt).</li>
                <li>Payment data is handled entirely by PCI-DSS compliant processors — we never store card numbers.</li>
                <li>Regular security audits and vulnerability assessments are conducted.</li>
              </ul>
            </section>

            <section className="privacy-section" id="data-retention">
              <div className="privacy-section__number">06</div>
              <h2 className="privacy-section__title">Data Retention</h2>
              <p>We retain your data only as long as necessary:</p>
              <ul>
                <li><strong>Account data:</strong> Until you delete your account.</li>
                <li><strong>Order history:</strong> 5 years for tax and legal compliance.</li>
                <li><strong>Support tickets:</strong> 2 years after resolution.</li>
                <li><strong>Technical logs:</strong> 90 days, then automatically purged.</li>
              </ul>
            </section>

            <section className="privacy-section" id="your-rights">
              <div className="privacy-section__number">07</div>
              <h2 className="privacy-section__title">Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li><strong>Access</strong> the personal data we hold about you.</li>
                <li><strong>Correct</strong> inaccurate or incomplete information.</li>
                <li><strong>Delete</strong> your account and associated data.</li>
                <li><strong>Export</strong> your data in a portable format (JSON/CSV).</li>
                <li><strong>Withdraw consent</strong> for optional data processing at any time.</li>
              </ul>
              <p>To exercise any of these rights, email us at <a href="mailto:privacy@bookshelf.com">privacy@bookshelf.com</a>. We respond within 30 days.</p>
            </section>

            <section className="privacy-section" id="children">
              <div className="privacy-section__number">08</div>
              <h2 className="privacy-section__title">Children's Privacy</h2>
              <p>BookShelf is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us data, please contact us and we will promptly delete it.</p>
            </section>

            <section className="privacy-section" id="changes">
              <div className="privacy-section__number">09</div>
              <h2 className="privacy-section__title">Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. When we make changes, we will:</p>
              <ul>
                <li>Update the "Last updated" date at the top of this page.</li>
                <li>Notify registered users via email for material changes.</li>
                <li>Provide a summary of what changed.</li>
              </ul>
            </section>

            <section className="privacy-section" id="contact">
              <div className="privacy-section__number">10</div>
              <h2 className="privacy-section__title">Contact Us</h2>
              <p>If you have questions about this Privacy Policy or how we handle your data, reach out:</p>
              <div className="privacy-contact-card">
                <div className="privacy-contact-card__row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href="mailto:privacy@bookshelf.com">privacy@bookshelf.com</a>
                </div>
                <div className="privacy-contact-card__row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </article>

      {/* ── Footer ── */}
      <footer className="privacy-footer">
        <div className="privacy-footer__inner">
          <p>© {new Date().getFullYear()} BookShelf. All rights reserved.</p>
          <Link to="/">Back to Store</Link>
        </div>
      </footer>
    </div>
  );
}

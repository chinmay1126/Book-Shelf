import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { describeApiError, fieldErrors } from '../utils/apiError.js';
import './Auth.css';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

const Login = () => {
  usePageMetadata({
    title: 'Log in',
    description:
      'Sign in to your BookShelf account to see your orders and your wishlist.',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError({});
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirect);
    } catch (err) {
      setError(describeApiError(err, 'Failed to login'));
      setFieldError(fieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('reader@example.com');
    setPassword('Password123!');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('AdminPassword123!');
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel">
        <div className="auth-header">
          <div className="auth-badge-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2>Log In</h2>
          <p className="auth-subtitle">Welcome back to your personal reading library</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                placeholder="reader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={fieldError.email ? 'true' : 'false'}
                aria-describedby={fieldError.email ? 'email-error' : undefined}
              />
            </div>
            {fieldError.email && (
              <span className="auth-field-error" id="email-error" role="alert">
                {fieldError.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={fieldError.password ? 'true' : 'false'}
                aria-describedby={fieldError.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldError.password && (
              <span className="auth-field-error" id="password-error" role="alert">
                {fieldError.password}
              </span>
            )}
          </div>

          <button type="submit" className="auth-button btn-primary" disabled={submitting}>
            {submitting ? (
              <span className="auth-btn-spinner">
                <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Logging in…
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-demo-section">
          <span className="auth-demo-label">Quick Demo Access</span>
          <div className="auth-demo-buttons">
            <button type="button" className="auth-demo-chip" onClick={fillDemoUser}>
              👤 Reader Demo
            </button>
            <button type="button" className="auth-demo-chip" onClick={fillDemoAdmin}>
              ⚡ Admin Demo
            </button>
          </div>
        </div>

        <p className="auth-footer-text">
          Don&apos;t have an account?{' '}
          <Link to={`/register?redirect=${redirect}`} className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

/**
 * Environment configuration, read in one place.
 *
 * Vite inlines `import.meta.env.*` at build time — the value baked into the
 * bundle is whatever was set when `vite build` ran, and cannot be changed
 * afterwards. Reading it here rather than scattered through the services
 * means there is one place to look when a deployment is pointed at the wrong
 * backend, and one place that validates the value.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

/**
 * Strip trailing slashes so `${base}/books` cannot produce `//books`.
 */
export function normaliseBaseUrl(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
}

function readApiBaseUrl() {
  const raw =
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.REACT_APP_API_URL;

  const normalised = normaliseBaseUrl(raw);

  if (!normalised) {
    return DEFAULT_API_BASE_URL;
  }

  if (!/^https?:\/\//i.test(normalised) && !normalised.startsWith('/')) {
    console.error(
      `[config] VITE_API_BASE_URL should start with http://, https:// or "/". ` +
        `Got "${raw}". Falling back to ${DEFAULT_API_BASE_URL}.`
    );
    return DEFAULT_API_BASE_URL;
  }

  return normalised;
}

export const API_BASE_URL = readApiBaseUrl();

export const CURRENCY_CODE = (import.meta.env?.VITE_CURRENCY ?? '').trim();

export const IS_PRODUCTION = import.meta.env?.PROD === true;

if (IS_PRODUCTION && API_BASE_URL.includes('localhost')) {
  console.warn(
    '[config] This production build points at localhost. ' +
      'Set VITE_API_BASE_URL or VITE_API_URL before running `vite build`.'
  );
}

export default { API_BASE_URL, CURRENCY_CODE, IS_PRODUCTION, normaliseBaseUrl };

import { Link } from 'react-router-dom';
import { useComparison } from '../hooks/useComparison.js';
import './CompareBar.css';

/**
 * Floating bar at the bottom of the screen when books are selected for
 * comparison. Shows the number of selected books, a "Compare" button that
 * navigates to the comparison page, and a "Clear" button.
 *
 * Hidden when no books are selected.
 */
export default function CompareBar() {
  const { compareIds, compareCount, maxCompare, clearCompare } =
    useComparison();

  if (compareCount === 0) return null;

  const idsParam = compareIds.join(',');

  return (
    <div className="compare-bar" role="status" aria-live="polite">
      <div className="compare-bar__inner">
        <span className="compare-bar__count">
          <span className="compare-bar__icon">⚖️</span>
          {compareCount} book{compareCount !== 1 ? 's' : ''} selected
          {compareCount < maxCompare && (
            <span className="compare-bar__hint">
              — add up to {maxCompare}
            </span>
          )}
        </span>

        <div className="compare-bar__actions">
          <button
            type="button"
            className="compare-bar__clear-btn"
            onClick={clearCompare}
          >
            Clear
          </button>
          {compareCount >= 2 && (
            <Link
              to={`/compare?ids=${idsParam}`}
              className="compare-bar__compare-btn"
            >
              Compare now →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getComparison } from '../services/comparisonService.js';
import { useComparison } from '../hooks/useComparison.js';
import { formatPrice, formatRating, isInStock } from '../utils/bookFormat.js';
import './BookComparePage.css';

/**
 * Comparison rows: label, accessor, and optional "best" highlight logic.
 *
 * Each row renders the same field across all compared books. The `best`
 * function returns true when a value is the best in the column set, which
 * the table uses to highlight the winner.
 */
const COMPARISON_ROWS = [
  {
    label: 'Price',
    accessor: (b) => b.price,
    format: (b) => formatPrice(b.price),
    best: (books) => {
      const prices = books.map((b) => b.price).filter((p) => typeof p === 'number');
      const min = Math.min(...prices);
      return (b) => typeof b.price === 'number' && b.price === min;
    },
  },
  {
    label: 'Rating',
    accessor: (b) => b.rating,
    format: (b) => (b.rating ? `★ ${formatRating(b.rating)}` : '—'),
    best: (books) => {
      const ratings = books.map((b) => b.rating).filter((r) => typeof r === 'number');
      const max = Math.max(...ratings);
      return (b) => typeof b.rating === 'number' && b.rating === max;
    },
  },
  {
    label: 'Genre',
    accessor: (b) => b.genre,
    format: (b) => b.genre || '—',
  },
  {
    label: 'Pages',
    accessor: (b) => b.pages,
    format: (b) => (b.pages ? `${b.pages} pages` : '—'),
    best: (books) => {
      const pages = books.map((b) => b.pages).filter((p) => typeof p === 'number');
      const max = Math.max(...pages);
      return (b) => typeof b.pages === 'number' && b.pages === max;
    },
  },
  {
    label: 'Availability',
    accessor: (b) => (isInStock(b) ? 1 : 0),
    format: (b) => {
      if (isInStock(b)) return `✅ In stock (${b.inventory ?? '?'})`;
      return '❌ Out of stock';
    },
    best: (books) => {
      const max = Math.max(...books.map((b) => b.inventory ?? 0));
      return (b) => (b.inventory ?? 0) === max && isInStock(b);
    },
  },
  {
    label: 'ISBN',
    accessor: (b) => b.isbn,
    format: (b) => b.isbn || '—',
  },
  {
    label: 'Year',
    accessor: (b) => b.year,
    format: (b) => b.year || '—',
    best: (books) => {
      const years = books.map((b) => b.year).filter(Boolean);
      if (years.length < 2) return () => false;
      const max = Math.max(...years);
      return (b) => b.year === max;
    },
  },
];

export default function BookComparePage() {
  const [searchParams] = useSearchParams();
  const { removeFromCompare, clearCompare } = useComparison();

  const [books, setBooks] = useState([]);
  const [missingIds, setMissingIds] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const idsParam = searchParams.get('ids') || '';
  const ids = useMemo(
    () => idsParam.split(',').filter(Boolean),
    [idsParam]
  );

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError('');

    getComparison(ids, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setBooks(data.books || []);
        setMissingIds(data.missingIds || []);
        setMeta(data.meta || null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        setError(err?.message || 'Failed to load comparison');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idsParam]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRemove(bookId) {
    removeFromCompare(bookId);
    // Update URL
    const remaining = ids.filter((id) => id !== bookId);
    if (remaining.length === 0) {
      window.history.replaceState({}, '', '/compare');
    } else {
      window.history.replaceState({}, '', `/compare?ids=${remaining.join(',')}`);
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  }

  if (loading) {
    return (
      <main className="bc-page bc-page--loading">
        <div className="bc-page__spinner" />
        <span>Loading comparison…</span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bc-page bc-page--error">
        <h2>Could not load comparison</h2>
        <p>{error}</p>
        <Link to="/" className="bc-page__back-link">← Back to catalogue</Link>
      </main>
    );
  }

  if (ids.length === 0 || books.length === 0) {
    return (
      <main className="bc-page">
        <header className="bc-page__header">
          <h1 className="bc-page__title">⚖️ Book Comparison</h1>
        </header>
        <div className="bc-page__empty">
          <span className="bc-page__empty-icon">⚖️</span>
          <h2>No books to compare</h2>
          <p>Select books from the catalogue using the compare toggle on each book card.</p>
          <Link to="/" className="bc-page__browse-btn">Browse books</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bc-page">
      <header className="bc-page__header">
        <h1 className="bc-page__title">⚖️ Book Comparison</h1>
        <div className="bc-page__header-actions">
          <Link to="/" className="bc-page__add-more-btn">+ Add more</Link>
          <button
            type="button"
            className="bc-page__clear-btn"
            onClick={clearCompare}
          >
            Clear all
          </button>
        </div>
      </header>

      {/* Meta summary */}
      {meta && (
        <div className="bc-page__meta">
          {meta.priceRange && (
            <span className="bc-page__meta-item">
              Price range: {formatPrice(meta.priceRange.min)} – {formatPrice(meta.priceRange.max)}
            </span>
          )}
          {meta.averageRating != null && (
            <span className="bc-page__meta-item">
              Avg rating: ★ {meta.averageRating}
            </span>
          )}
          {meta.genres.length > 0 && (
            <span className="bc-page__meta-item">
              Genres: {meta.genres.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Missing books warning */}
      {missingIds.length > 0 && (
        <div className="bc-page__missing" role="alert">
          <strong>Note:</strong> {missingIds.length} book{missingIds.length !== 1 ? 's' : ''} could not be loaded: {missingIds.join(', ')}
        </div>
      )}

      {/* Comparison table */}
      <div className="bc-page__table-wrapper">
        <table className="bc-page__table" role="grid">
          <thead>
            <tr>
              <th className="bc-page__label-col" scope="col">Feature</th>
              {books.map((book) => (
                <th key={book.id} className="bc-page__book-col" scope="col">
                  <div className="bc-page__book-header">
                    <Link to={`/book/${book.id}`} className="bc-page__book-title-link">
                      {book.title}
                    </Link>
                    <span className="bc-page__book-author">{book.author}</span>
                    <button
                      type="button"
                      className="bc-page__remove-btn"
                      onClick={() => handleRemove(book.id)}
                      aria-label={`Remove ${book.title} from comparison`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => {
              const isBest = row.best ? row.best(books) : null;
              return (
                <tr key={row.label}>
                  <th className="bc-page__label-col" scope="row">{row.label}</th>
                  {books.map((book) => (
                    <td
                      key={book.id}
                      className={`bc-page__cell ${isBest && isBest(book) ? 'bc-page__cell--best' : ''}`}
                    >
                      {row.format(book)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Description row */}
            <tr>
              <th className="bc-page__label-col" scope="row">Description</th>
              {books.map((book) => (
                <td key={book.id} className="bc-page__cell bc-page__cell--description">
                  {book.description || '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

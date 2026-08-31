import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Rating from '../components/Rating.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import StockAlertButton from '../components/StockAlertButton.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import BookCard from '../components/BookCard.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { useBook } from '../hooks/useBook.js';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { getBooks } from '../services/bookService.js';
import { createReview, getMyReview } from '../services/reviewService.js';
import {
  describeStock,
  formatPrice,
  formatRating,
  isInStock,
} from '../utils/bookFormat.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { bookDescription, bookTitle } from '../utils/pageTitle.js';
import '../components/StockAlertButton.css';
import './BookDetail.css';

/**
 * The book detail page.
 *
 * It used to read `src/data/books.js` — a hardcoded copy of the backend's
 * `books.json`, kept in the repo for a frontend-only draft and never removed.
 * The grid on Home has fetched `/api/books` since #274, so the two views of
 * the same book disagreed about its price and rating, the detail page had no
 * idea whether anything was in stock (`inventory` does not exist in the local
 * copy), and a book added to the catalogue rendered "Book Not Found" on its
 * own page. See #317.
 */
import BookReviewSummary from '../components/BookReviewSummary.jsx';
import ISBNCopy from '../components/ISBNCopy.jsx';
import BookBadge from '../components/BookBadge.jsx';
import VerifiedPurchaseBadge from '../components/VerifiedPurchaseBadge.jsx';
import BookSpine from '../components/BookSpine.jsx';
import BookAvailability from '../components/BookAvailability.jsx';
import BookActions from '../components/BookActions.jsx';
import ReviewForm from '../components/ReviewForm.jsx';

export default function BookDetail() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { book, loading, notFound, error, reload } = useBook(id);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  usePageMetadata({
    title: notFound ? 'Book not found' : book ? bookTitle(book) : null,
    description: notFound ? 'That book is not in the BookShelf catalogue.' : bookDescription(book),
  });

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [related, setRelated] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  /*
   * Bumped after a review is posted, to remount ReviewList and make it
   * refetch.
   *
   * It belongs here, with every other hook, and not 130 lines down past the
   * loading, not-found and error returns where it used to sit. The first
   * render of this page is always the loading render and it returns before
   * reaching that point, so React recorded one fewer hook than the render
   * that followed it and threw `Rendered more hooks than during the previous
   * render` the moment the book arrived — which is to say on every book, every
   * time. Same defect as #365 and #366: React counts where the call is, not
   * where the value is used.
   */
  const [reviewKey, setReviewKey] = useState(0);

  useEffect(() => {
    setRating(0);
    setReviewTitle('');
    setReviewText('');
    setReviewError('');
    setSuccessMsg('');
    setMyReview(null);
    setReviewKey(0);
  }, [id]);

  /*
   * Fetch the current user's existing review for this book so the form
   * can pre-populate and the user knows they are editing rather than
   * creating a new review.
   */
  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    let cancelled = false;

    getMyReview(id, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const existing = data?.review;
        if (existing) {
          setMyReview(existing);
          setRating(existing.rating);
          setReviewTitle(existing.title || '');
          setReviewText(existing.body || '');
        }
      })
      .catch(() => {
        // 404 means no review exists yet — perfectly normal.
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    if (!book?.genre) {
      setRelated([]);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    getBooks({ genre: book.genre, limit: 5 }, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const others = (data?.books ?? [])
          .filter((candidate) => String(candidate.id) !== String(book.id))
          .slice(0, 4);
        setRelated(others);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [book?.id, book?.genre]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (rating === 0) {
      setReviewError('Please select a rating before submitting.');
      return;
    }

    setReviewError('');
    setReviewSubmitting(true);

    try {
      await createReview({
        bookId: id,
        rating,
        title: reviewTitle.trim(),
        body: reviewText.trim(),
      });
      setSuccessMsg('Thank you! Your review has been submitted.');
      setMyReview({ rating, title: reviewTitle, body: reviewText });
      // Force the ReviewList to re-fetch by toggling a key.
      setReviewKey((k) => k + 1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="book-detail-page">
        <SkeletonLoader variant="detail" count={1} />
      </main>
    );
  }

  if (notFound) {
    return (
      <div className="book-detail-not-found">
        <h2>{t('bookDetail.notFound') || 'Book Not Found'}</h2>
        <Link to="/" className="book-detail-back-link">
          {t('bookDetail.returnToCatalog') || 'Return to Catalog'}
        </Link>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-not-found">
        <h2>We could not load this book</h2>
        <p className="book-detail-error-message">{error}</p>
        <button type="button" className="book-detail-retry" onClick={reload}>
          Try again
        </button>
        <Link to="/" className="book-detail-back-link">
          {t('bookDetail.returnToCatalog') || 'Return to Catalog'}
        </Link>
      </div>
    );
  }

  const ratingLabel = formatRating(book.rating);
  const priceLabel = formatPrice(book.price);
  const stockLabel = describeStock(book);
  const available = isInStock(book);

  /*
   * `sampleChapters` and `bookMetadataObj` used to be built here, on every
   * render, and were no longer read by anything. Both were hardcoded
   * placeholders — four chapter titles beginning "Introduction & Foundations",
   * and a metadata block asserting every book in the catalogue is a hardcover
   * 1st Edition (2026) of 340 pages. Left in the tree they would eventually
   * have been rendered by someone who took them for real data.
   */

  return (
    <main className="book-detail-page">
      <div className="book-detail-container">
        <div className="book-detail-image-wrapper" style={{ '--cover-color': book.cover }}>
          <div className="book-detail-cover">
            <span className="book-detail-cover-genre">{book.genre}</span>
            <span className="book-detail-cover-title">{book.title}</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <BookSpine title={book.title} author={book.author} color={book.cover} />
          </div>
        </div>

        <div className="book-detail-content">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <BookBadge type="bestSeller" />
            <BookBadge type="editorsPick" />
          </div>

          <h1 className="book-detail-title">{book.title}</h1>
          <p className="book-detail-author">
            {t('bookDetail.by') || 'by'} {book.author}
          </p>

          <div className="book-detail-metadata">
            {book.genre && <span className="book-detail-badge">{book.genre}</span>}
            {ratingLabel && <span className="book-detail-rating">★ {ratingLabel}</span>}
            {priceLabel && <span className="book-detail-price">{priceLabel}</span>}
            {stockLabel && (
              <span className={`book-detail-stock ${available ? '' : 'book-detail-stock--out'}`}>
                {stockLabel}
              </span>
            )}
          </div>

          <div style={{ margin: '12px 0' }}>
            <BookAvailability stock={book.inventory ?? (available ? 10 : 0)} inStock={available} />
          </div>

          <div className="book-detail-description">
            <p>{book.description || t('bookDetail.noDescription')}</p>
          </div>

          <div style={{ margin: '16px 0' }}>
            <ISBNCopy isbn={book.isbn || '978-1-60309-502-0'} />
          </div>

          <div className="book-detail-actions">
            <button
              className="book-detail-add-btn"
              onClick={() => addToCart(book)}
              disabled={!available}
            >
              {available ? t('bookDetail.addToCart') || 'Add to Cart' : 'Out of stock'}
            </button>
            <WishlistButton
              active={isWishlisted(book.id)}
              onToggle={() => toggleWishlist(book.id)}
            />
            {!available && (
              <StockAlertButton bookId={book.id} isLoggedIn={true} />
            )}
          </div>

          <div style={{ marginTop: '12px' }}>
            <BookActions
              onAddToCart={() => addToCart(book)}
              onWishlist={() => toggleWishlist(book.id)}
              isWishlisted={isWishlisted(book.id)}
            />
          </div>
        </div>
      </div>

      {/*
        ReviewList is keyed by `reviewKey` so that after a new review is
        submitted the component re-mounts and fetches the fresh data.
        Without the key it would hold the stale first-page response
        from when it first rendered.
      */}
      <ReviewList key={reviewKey} bookId={id} currentUserId={undefined} />

      <div className="book-review-section">
        {book.rating ? (
          <BookReviewSummary
            rating={book.rating}
            reviewCount={book.reviewsCount || 42}
            totalRatings={50}
          />
        ) : null}
        <div style={{ margin: '16px 0 24px 0' }}>
          <VerifiedPurchaseBadge />
        </div>

        <ReviewForm
          bookId={id}
          existingReview={myReview}
          bookTitle={book.title}
          onSubmit={async ({ rating: formRating, title: formTitle, body: formBody }) => {
            setReviewError('');
            try {
              await createReview({
                bookId: id,
                rating: formRating,
                title: formTitle,
                body: formBody,
              });
              setSuccessMsg('Thank you! Your review has been submitted.');
              setMyReview({ rating: formRating, title: formTitle, body: formBody });
              setReviewKey((k) => k + 1);
              setTimeout(() => setSuccessMsg(''), 4000);
            } catch (err) {
              setReviewError(err.message || 'Failed to submit review. Please try again.');
              throw err;
            }
          }}
        />
      </div>

      {related.length > 0 && (
        <div className="book-related-section">
          <h2 className="book-related-title">
            {t('bookDetail.relatedBooks') || 'Related Books'}
          </h2>
          <div className="book-related-grid">
            {related.map((relatedBook) => (
              <BookCard key={relatedBook.id} book={relatedBook} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

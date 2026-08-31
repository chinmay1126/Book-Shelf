import { useContext } from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton.jsx';
import { useWishlist } from '../hooks/useWishlist.js';
import { useCart } from '../hooks/useCart.js';
import { useComparison } from '../hooks/useComparison.js';
import { formatPrice, formatRating, isInStock } from '../utils/bookFormat.js';
import './BookCard.css';

/**
 * BookCard — displays a single book as a card.
 *
 * Props:
 *   book        {object}   required — the book data object
 *   onAddToCart {function} optional — override the default cart addToCart.
 *                          Useful where the book object the parent holds
 *                          differs from what the cart expects
 *                          (e.g. RecentlyViewed). Falls back to addToCart.
 */
export default function BookCard({ book, onAddToCart }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isComparing, toggleCompare, compareCount, maxCompare } = useComparison();
  const wishlisted = isWishlisted(book.id);
  const comparing = isComparing(book.id);

  // `book.rating.toFixed(1)` ran unguarded here. Nothing requires a book to
  // carry a rating, and one record without it threw a TypeError that took the
  // whole grid down rather than leaving one line blank. See #317.
  const ratingLabel = formatRating(book.rating);
  const priceLabel = formatPrice(book.price);
  const available = isInStock(book);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(book);
      return;
    }
    addToCart(book);
  };

  return (
    <article className="book-card">
      <div className="book-card__cover" style={{ '--cover-color': book.cover }}>
        <span className="book-card__genre">{book.genre}</span>
        <span className="book-card__cover-title">{book.title}</span>
        <div className="book-card__wishlist-overlay">
          <WishlistButton
            active={wishlisted}
            onToggle={() => toggleWishlist(book.id)}
          />
        </div>
      </div>

      {/* Body — title, author, rating/price, actions */}
      <div className="book-card__body">
        <Link to={`/book/${book.id}`} className="book-card__link">
          <h3 className="book-card__title">{book.title}</h3>
        </Link>
        <p className="book-card__author">{book.author}</p>

        <div className="book-card__meta">
          {ratingLabel && (
            <span className="book-card__rating">★ {ratingLabel}</span>
          )}
          {priceLabel && <span className="book-card__price">{priceLabel}</span>}
        </div>

        <div className="book-card__actions">
          <button
            className="book-card__add"
            onClick={handleAddToCart}
            disabled={!available}
          >
            {available ? 'Add to cart' : 'Out of stock'}
          </button>
          <button
            type="button"
            className={`book-card__compare ${comparing ? 'book-card__compare--active' : ''}`}
            onClick={() => toggleCompare(book.id)}
            disabled={!comparing && compareCount >= maxCompare}
            title={comparing ? 'Remove from comparison' : 'Add to comparison'}
            aria-label={comparing ? 'Remove from comparison' : 'Add to comparison'}
          >
            {comparing ? '⚖️' : '⚖️'}
          </button>
        </div>
      </div>
    </article>
  );
}

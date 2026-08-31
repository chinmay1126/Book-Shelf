import { useState } from 'react';
import StarRating from './StarRating.jsx';
import './ReviewForm.css';

/**
 * Form for submitting or editing a book review.
 *
 * Supports both `existingReview` and `initial` props for edit pre-population.
 */
export default function ReviewForm({
  bookId,
  existingReview = null,
  initial = null,
  onSubmit,
  onCancel,
  bookTitle = '',
  maxLength = 2000,
}) {
  const reviewData = existingReview || initial;
  const isEdit = Boolean(reviewData);

  const [rating, setRating] = useState(reviewData?.rating || 0);
  const [title, setTitle] = useState(reviewData?.title || '');
  const [body, setBody] = useState(reviewData?.body || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function validate() {
    const errs = {};
    if (!rating || rating < 1 || rating > 5) {
      errs.rating = 'Please select a rating';
    }
    if (title.length > 150) {
      errs.title = 'Title must be at most 150 characters';
    }
    if (body.length > maxLength) {
      errs.body = `Review must be at most ${maxLength} characters`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit({
        bookId,
        rating,
        title: title.trim(),
        body: body.trim(),
      });
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h3 className="review-form__heading">
        {isEdit ? '✏️ Edit your review' : '✍️ Write a review'}
      </h3>

      {bookTitle && (
        <p className="review-form__book-title">
          for <strong>{bookTitle}</strong>
        </p>
      )}

      {/* Rating */}
      <div className="review-form__field">
        <label className="review-form__label" id="review-rating-label">
          Your rating *
        </label>
        <StarRating
          value={rating}
          onChange={(newRating) => {
            setRating(newRating);
            if (errors.rating) setErrors((prev) => ({ ...prev, rating: '' }));
          }}
          size="lg"
          label="Your rating"
        />
        {errors.rating && <span className="review-form__error">{errors.rating}</span>}
      </div>

      {/* Title */}
      <div className="review-form__field">
        <label htmlFor="review-title" className="review-form__label">
          Review title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          className="review-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. A must-read for fans of the genre"
          maxLength={150}
          disabled={submitting}
        />
        <span className="review-form__char-count">
          {title.length}/150
        </span>
        {errors.title && <span className="review-form__error">{errors.title}</span>}
      </div>

      {/* Body */}
      <div className="review-form__field">
        <label htmlFor="review-body" className="review-form__label">
          Your review (optional)
        </label>
        <textarea
          id="review-body"
          className="review-form__textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this book…"
          rows={6}
          maxLength={maxLength}
          disabled={submitting}
        />
        <span className="review-form__char-count">
          {body.length}/{maxLength}
        </span>
        {errors.body && <span className="review-form__error">{errors.body}</span>}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="review-form__global-error" role="alert">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="review-form__actions">
        {onCancel && (
          <button
            type="button"
            className="review-form__btn review-form__btn--cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="review-form__btn review-form__btn--submit"
          disabled={submitting}
        >
          {submitting
            ? isEdit ? 'Updating…' : 'Submitting…'
            : isEdit ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

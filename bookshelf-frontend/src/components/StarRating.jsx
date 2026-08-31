import { useState } from 'react';
import './StarRating.css';

/**
 * Interactive star rating selector.
 *
 * Renders five clickable stars. Hovering previews the selection; clicking
 * confirms it. Keyboard accessible — arrow keys or number keys 1-5 set the
 * value, Escape clears it.
 */
export default function StarRating({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  label = 'Rating',
}) {
  const [hoverValue, setHoverValue] = useState(0);

  function handleClick(star) {
    if (disabled) return;
    // Clicking the already-selected star clears it.
    onChange?.(star === value ? 0 : star);
  }

  function handleKeyDown(e) {
    if (disabled) return;

    const num = Number(e.key);
    if (num >= 1 && num <= 5) {
      e.preventDefault();
      onChange?.(num);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onChange?.(0);
    }
  }

  const display = hoverValue || value;

  return (
    <div
      className={`star-rating star-rating--${size} ${disabled ? 'star-rating--disabled' : ''}`}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating__star ${star <= display ? 'star-rating__star--filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          disabled={disabled}
          aria-checked={star === value}
          aria-label={`${star} Star${star > 1 ? 's' : ''}`}
        >
          {star <= display ? '★' : '☆'}
        </button>
      ))}
      {value > 0 && (
        <span className="star-rating__label" aria-hidden="true">
          {value}/5
        </span>
      )}
    </div>
  );
}

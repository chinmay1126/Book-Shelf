import api from '../utils/api.js';

/**
 * Service layer for the BookShelf reviews API.
 *
 * Every function goes through the shared axios instance so it inherits the
 * retry policy, timeout, and normalised error shape.
 */

/**
 * @typedef {Object} ReviewPage
 * @property {Array} reviews
 * @property {number} page
 * @property {number} limit
 * @property {number} totalReviews
 * @property {number} totalPages
 */

/**
 * @typedef {Object} ReviewBreakdown
 * @property {string} bookId
 * @property {number} averageRating
 * @property {number} totalReviews
 * @property {Array<{star: number, count: number}>} breakdown
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId
 * @property {string} bookId
 * @property {number} rating
 * @property {string} title
 * @property {string} body
 * @property {boolean} verifiedPurchase
 * @property {number} helpfulCount
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Fetch a page of reviews for a book.
 *
 * @param {string} bookId
 * @param {Object} [opts]
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 * @param {string} [opts.sort='newest'] — 'newest' | 'helpful'
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<ReviewPage>}
 */
export async function getBookReviews(bookId, { page = 1, limit = 10, sort = 'newest', signal } = {}) {
  const response = await api.get(`/reviews/${encodeURIComponent(bookId)}`, {
    params: { page, limit, sort },
    signal,
  });
  return response.data;
}

/**
 * Fetch the star-distribution breakdown for a book.
 *
 * @param {string} bookId
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<ReviewBreakdown>}
 */
export async function getReviewBreakdown(bookId, { signal } = {}) {
  const response = await api.get(`/reviews/${encodeURIComponent(bookId)}/breakdown`, {
    signal,
  });
  return response.data;
}

/**
 * Create a new review.
 *
 * @param {Object} data
 * @param {string} data.bookId
 * @param {number} data.rating — 1-5
 * @param {string} [data.title]
 * @param {string} [data.body]
 * @returns {Promise<{message: string, review: Review}>}
 */
export async function createReview({ bookId, rating, title, body }) {
  const response = await api.post('/reviews', { bookId, rating, title, body });
  return response.data;
}

/**
 * Update an existing review.
 *
 * @param {string} reviewId
 * @param {Object} updates
 * @param {number} [updates.rating]
 * @param {string} [updates.title]
 * @param {string} [updates.body]
 * @returns {Promise<{message: string, review: Review}>}
 */
export async function updateReview(reviewId, updates) {
  const response = await api.put(`/reviews/${encodeURIComponent(reviewId)}`, updates);
  return response.data;
}

/**
 * Delete (soft-hide) a review.
 *
 * @param {string} reviewId
 * @returns {Promise<{message: string}>}
 */
export async function deleteReview(reviewId) {
  const response = await api.delete(`/reviews/${encodeURIComponent(reviewId)}`);
  return response.data;
}

/**
 * Mark a review as helpful.
 *
 * @param {string} reviewId
 * @returns {Promise<{message: string, helpfulCount: number}>}
 */
export async function markReviewHelpful(reviewId) {
  const response = await api.post(`/reviews/${encodeURIComponent(reviewId)}/helpful`);
  return response.data;
}

/**
 * Get the current user's review for a specific book.
 *
 * @param {string} bookId
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{review: Review}>}
 */
export async function getMyReview(bookId, { signal } = {}) {
  const response = await api.get(`/reviews/${encodeURIComponent(bookId)}/mine`, {
    signal,
  });
  return response.data;
}

// Aliases for compatibility
export const getReviews = (bookId, opts = {}, reqOpts = {}) => getBookReviews(bookId, { ...opts, ...reqOpts });
export const getReviewStats = (bookId, reqOpts = {}) => getReviewBreakdown(bookId, reqOpts);
export const submitReview = (bookId, data) => createReview({ bookId, ...data });
export const toggleHelpful = markReviewHelpful;

export default {
  getBookReviews,
  getReviewBreakdown,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getMyReview,
  getReviews,
  getReviewStats,
  submitReview,
  toggleHelpful,
};

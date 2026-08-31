import api from '../utils/api.js';
import { demoBooks } from '../data/books.js';

/** Raised for a book id the catalogue does not have. */
export class BookNotFoundError extends Error {
  constructor(bookId) {
    super(`Book not found: ${bookId}`);
    this.name = 'BookNotFoundError';
    this.status = 404;
    this.bookId = bookId;
  }
}

/**
 * Fetch one book.
 */
export async function getBookById(bookId, { signal } = {}) {
  if (typeof bookId !== 'string' || bookId.trim() === '') {
    throw new BookNotFoundError(String(bookId));
  }

  const cleanId = bookId.trim();

  try {
    const response = await api.get(`/books/${encodeURIComponent(cleanId)}`, {
      signal,
    });
    return response.data;
  } catch (error) {
    if (error?.status === 404) {
      throw new BookNotFoundError(cleanId);
    }
    // Fallback to local demo book if network is offline
    const localBook = demoBooks.find((b) => b.id === cleanId);
    if (localBook) {
      return localBook;
    }
    throw error;
  }
}

/**
 * Fetch a page of the catalogue.
 */
export async function getBooks(params = {}, { signal } = {}) {
  const response = await api.get('/books', { params, signal });
  return response.data;
}

/**
 * Resolve a list of book ids against the catalogue.
 */
export async function getBooksByIds(ids, { signal } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { books: [], missingIds: [], failedIds: [] };
  }

  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.trim() !== ''))];

  const settled = await Promise.allSettled(
    uniqueIds.map((id) => getBookById(id, { signal }))
  );

  const books = [];
  const missingIds = [];
  const failedIds = [];

  settled.forEach((result, index) => {
    const id = uniqueIds[index];

    if (result.status === 'fulfilled') {
      books.push(result.value);
      return;
    }

    const error = result.reason;

    if (error?.name === 'BookNotFoundError' || error?.status === 404) {
      missingIds.push(id);
    } else {
      failedIds.push(id);
    }
  });

  return { books, missingIds, failedIds };
}

/** Distinct genres with counts, from GET /api/books/genres. */
export async function getGenres({ signal } = {}) {
  const response = await api.get('/books/genres', { signal });
  return response.data?.genres ?? [];
}

/** Create a new book listing (admin only). */
export async function createBook(bookData) {
  const response = await api.post('/books', bookData);
  return response.data;
}

/** Update an existing book listing by id (admin only). */
export async function updateBook(id, bookData) {
  const response = await api.put(`/books/${encodeURIComponent(id)}`, bookData);
  return response.data;
}

/** Delete a book listing by id (admin only). */
export async function deleteBook(id) {
  const response = await api.delete(`/books/${encodeURIComponent(id)}`);
  return response.data;
}

/** Patch stock/inventory for a book by id (admin only). */
export async function updateBookStock(id, stockData) {
  const response = await api.patch(`/books/${encodeURIComponent(id)}/stock`, stockData);
  return response.data;
}

export default {
  getBookById,
  getBooks,
  getBooksByIds,
  getGenres,
  createBook,
  updateBook,
  deleteBook,
  updateBookStock,
  BookNotFoundError,
};

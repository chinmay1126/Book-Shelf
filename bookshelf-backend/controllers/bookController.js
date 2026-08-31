import bookRepository from '../repositories/bookRepository.js';
import {
  parseBookQuery,
  queryBooks,
  collectGenres,
  QueryValidationError,
} from '../utils/bookQuery.js';
import eventBus, { EVENTS } from '../utils/eventEmitter.js';

// @desc    List books with search, filter, sort and pagination
// @route   GET /api/books
// @access  Public
export const getAllBooks = async (req, res, next) => {
  try {
    const filters = parseBookQuery(req.query);
    const books = await bookRepository.getBooksAsync();
    const result = queryBooks(books, filters);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof QueryValidationError) {
      return res.status(400).json({
        message: error.message,
        parameter: error.parameter,
      });
    }

    next(error);
  }
};

// @desc    Distinct genres in the catalogue, with counts
// @route   GET /api/books/genres
// @access  Public
export const getBookGenres = async (req, res, next) => {
  try {
    const books = await bookRepository.getBooksAsync();
    res.status(200).json({ genres: collectGenres(books) });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch a single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res, next) => {
  try {
    const book = await bookRepository.getBookByIdAsync(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: `Book not found: ${req.params.id}`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Admin
export const createBook = (req, res, next) => {
  try {
    const newBook = bookRepository.addBook(req.body);
    res.status(201).json({
      message: 'Book created successfully',
      book: newBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing book
// @route   PUT /api/books/:id
// @access  Admin
export const updateBook = (req, res, next) => {
  try {
    const oldBook = bookRepository.getBookById(req.params.id);
    const updated = bookRepository.updateBook(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        message: `Book not found: ${req.params.id}`,
      });
    }

    if (oldBook) {
      if (typeof req.body.price === 'number' && req.body.price < oldBook.price) {
        eventBus.emitAsync(EVENTS.BOOK_PRICE_UPDATED, {
          bookId: updated.id,
          oldPrice: oldBook.price,
          newPrice: updated.price,
          bookTitle: updated.title,
        });
      }

      if (typeof req.body.inventory === 'number' && req.body.inventory > oldBook.inventory) {
        eventBus.emitAsync(EVENTS.BOOK_STOCK_REPLENISHED, {
          bookId: updated.id,
          newStock: updated.inventory,
          bookTitle: updated.title,
        });
      }
    }

    res.status(200).json({
      message: 'Book updated successfully',
      book: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Admin
export const deleteBook = (req, res, next) => {
  try {
    const success = bookRepository.deleteBook(req.params.id);
    if (!success) {
      return res.status(404).json({
        message: `Book not found: ${req.params.id}`,
      });
    }

    res.status(200).json({
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book stock / inventory level
// @route   PATCH /api/books/:id/stock
// @access  Admin
export const updateBookStock = (req, res, next) => {
  try {
    const oldBook = bookRepository.getBookById(req.params.id);
    const updated = bookRepository.updateBookStock(req.params.id, req.body.inventory);
    if (!updated) {
      return res.status(404).json({
        message: `Book not found: ${req.params.id}`,
      });
    }

    if (oldBook && typeof req.body.inventory === 'number' && req.body.inventory > oldBook.inventory) {
      eventBus.emitAsync(EVENTS.BOOK_STOCK_REPLENISHED, {
        bookId: updated.id,
        newStock: updated.inventory,
        bookTitle: updated.title,
      });
    }

    res.status(200).json({
      message: 'Stock updated successfully',
      book: updated,
    });
  } catch (error) {
    next(error);
  }
};

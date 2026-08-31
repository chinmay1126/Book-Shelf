import * as readingListService from '../services/readingListService.js';

export const addBook = async (req, res, next) => {
  try {
    const result = await readingListService.addBook(req.user._id, req.body);
    const status = result.isNew ? 201 : 200;
    res.status(status).json({
      message: result.message,
      entry: result.entry,
      stats: result.stats,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getMyList = async (req, res, next) => {
  try {
    const result = await readingListService.getMyList(req.user._id, req.query);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const checkBook = async (req, res, next) => {
  try {
    const result = await readingListService.checkBook(req.user._id, req.params.bookId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const result = await readingListService.updateEntry(
      req.params.entryId,
      req.user._id,
      req.body
    );
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const removeBook = async (req, res, next) => {
  try {
    const result = await readingListService.removeBook(req.params.entryId, req.user._id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const removeByBookId = async (req, res, next) => {
  try {
    const result = await readingListService.removeByBookId(req.user._id, req.params.bookId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const reorderEntries = async (req, res, next) => {
  try {
    const result = await readingListService.reorderEntries(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await readingListService.getStats(req.user._id);
    res.json(stats);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export default {
  addBook,
  getMyList,
  checkBook,
  updateEntry,
  removeBook,
  removeByBookId,
  reorderEntries,
  getStats,
};

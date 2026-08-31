import ReadingList, { SHELVES } from '../models/ReadingList.js';

export async function shelfStats(userId) {
  const counts = await ReadingList.aggregate([
    { $match: { userId } },
    { $group: { _id: '$shelf', count: { $sum: 1 } } },
  ]);

  const stats = {};
  for (const shelf of SHELVES) {
    stats[shelf] = 0;
  }
  for (const { _id, count } of counts) {
    stats[_id] = count;
  }
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  return stats;
}

export function formatEntry(entry) {
  const obj = entry.toObject ? entry.toObject() : entry;
  return {
    id: obj._id.toString(),
    bookId: obj.bookId,
    userId: obj.userId?.toString?.() || obj.userId,
    shelf: obj.shelf,
    notes: obj.notes,
    rating: obj.rating,
    progress: obj.progress,
    startedAt: obj.startedAt,
    finishedAt: obj.finishedAt,
    sortOrder: obj.sortOrder,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

export async function addBook(userId, { bookId, shelf = 'want-to-read', notes, rating }) {
  let entry = await ReadingList.findOne({ userId, bookId });

  if (entry) {
    const previousShelf = entry.shelf;
    entry.shelf = shelf;

    if (shelf === 'currently-reading' && previousShelf !== 'currently-reading') {
      entry.startedAt = new Date();
      entry.progress = entry.progress ?? 0;
    }
    if (shelf === 'finished' && previousShelf !== 'finished') {
      entry.finishedAt = new Date();
      entry.progress = 100;
    }
    if (shelf === 'want-to-read') {
      entry.progress = null;
      entry.startedAt = null;
      entry.finishedAt = null;
    }

    if (notes !== undefined) entry.notes = notes;
    if (rating !== undefined) entry.rating = rating;

    await entry.save();

    const stats = await shelfStats(userId);
    return {
      message: `Moved to "${shelf}"`,
      entry: formatEntry(entry),
      stats,
      isNew: false,
    };
  }

  const newEntry = {
    userId,
    bookId,
    shelf,
    notes: notes || '',
    rating: rating || null,
  };

  if (shelf === 'currently-reading') {
    newEntry.startedAt = new Date();
    newEntry.progress = 0;
  }
  if (shelf === 'finished') {
    newEntry.finishedAt = new Date();
    newEntry.progress = 100;
  }

  entry = await ReadingList.create(newEntry);
  const stats = await shelfStats(userId);

  return {
    message: `Added to "${shelf}"`,
    entry: formatEntry(entry),
    stats,
    isNew: true,
  };
}

export async function getMyList(userId, { shelf }) {
  const filter = { userId };
  if (shelf && SHELVES.includes(shelf)) {
    filter.shelf = shelf;
  }

  const entries = await ReadingList.find(filter)
    .sort({ shelf: 1, sortOrder: 1, createdAt: -1 })
    .lean();

  const stats = await shelfStats(userId);

  return {
    entries: entries.map((e) => ({ ...e, id: e._id.toString() })),
    stats,
  };
}

export async function checkBook(userId, bookId) {
  const entry = await ReadingList.findOne({
    userId,
    bookId,
  }).lean();

  if (!entry) {
    return { onList: false, entry: null };
  }

  return { onList: true, entry: formatEntry(entry) };
}

export async function updateEntry(entryId, userId, updateData) {
  const entry = await ReadingList.findById(entryId);

  if (!entry) {
    const err = new Error('Reading list entry not found');
    err.statusCode = 404;
    throw err;
  }

  if (entry.userId.toString() !== userId.toString()) {
    const err = new Error('Not your reading list');
    err.statusCode = 403;
    throw err;
  }

  const { shelf, notes, rating, progress } = updateData;
  const previousShelf = entry.shelf;

  if (shelf !== undefined && shelf !== entry.shelf) {
    entry.shelf = shelf;

    if (shelf === 'currently-reading' && previousShelf !== 'currently-reading') {
      entry.startedAt = entry.startedAt || new Date();
      if (entry.progress === null || entry.progress === undefined) {
        entry.progress = 0;
      }
    }
    if (shelf === 'finished' && previousShelf !== 'finished') {
      entry.finishedAt = new Date();
      entry.progress = 100;
    }
    if (shelf === 'want-to-read') {
      entry.progress = null;
    }
  }

  if (notes !== undefined) entry.notes = notes;
  if (rating !== undefined) entry.rating = rating;
  if (progress !== undefined && entry.shelf === 'currently-reading') {
    entry.progress = Math.min(100, Math.max(0, progress));
  }

  await entry.save();

  const stats = await shelfStats(userId);
  return {
    message: 'Entry updated',
    entry: formatEntry(entry),
    stats,
  };
}

export async function removeBook(entryId, userId) {
  const entry = await ReadingList.findById(entryId);

  if (!entry) {
    const err = new Error('Reading list entry not found');
    err.statusCode = 404;
    throw err;
  }

  if (entry.userId.toString() !== userId.toString()) {
    const err = new Error('Not your reading list');
    err.statusCode = 403;
    throw err;
  }

  await ReadingList.findByIdAndDelete(entryId);
  const stats = await shelfStats(userId);
  return { message: 'Removed from reading list', stats };
}

export async function removeByBookId(userId, bookId) {
  const result = await ReadingList.findOneAndDelete({
    userId,
    bookId,
  });

  if (!result) {
    const err = new Error('Book not on reading list');
    err.statusCode = 404;
    throw err;
  }

  const stats = await shelfStats(userId);
  return { message: 'Removed from reading list', stats };
}

export async function reorderEntries(userId, { shelf, orderedIds }) {
  if (!shelf || !Array.isArray(orderedIds)) {
    const err = new Error('shelf and orderedIds array are required');
    err.statusCode = 400;
    throw err;
  }

  const updates = orderedIds.map((id, index) =>
    ReadingList.findOneAndUpdate(
      { _id: id, userId, shelf },
      { sortOrder: index },
      { new: true }
    )
  );

  await Promise.all(updates);

  const entries = await ReadingList.find({ userId, shelf })
    .sort({ sortOrder: 1 })
    .lean();

  return {
    message: 'Reordered',
    entries: entries.map((e) => ({ ...e, id: e._id.toString() })),
  };
}

export async function getStats(userId) {
  const stats = await shelfStats(userId);

  const avgResult = await ReadingList.aggregate([
    { $match: { userId, shelf: 'finished', rating: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  stats.averageRating = avgResult.length > 0
    ? Math.round(avgResult[0].avg * 10) / 10
    : null;
  stats.ratedCount = avgResult.length > 0 ? avgResult[0].count : 0;

  const currentBooks = await ReadingList.find({
    userId,
    shelf: 'currently-reading',
    progress: { $ne: null },
  })
    .select('bookId progress')
    .lean();

  stats.currentlyReading = currentBooks.map((b) => ({
    bookId: b.bookId,
    progress: b.progress,
  }));

  return stats;
}

import BookClub from '../models/BookClub.js';
import User from '../models/User.js';
import eventBus, { EVENTS } from '../utils/eventEmitter.js';

/**
 * Format a club document for full API response.
 */
export function formatClub(club) {
  const obj = club.toObject ? club.toObject() : club;
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    genre: obj.genre,
    maxMembers: obj.maxMembers,
    currentBookId: obj.currentBookId,
    currentBookTitle: obj.currentBookTitle,
    isPublic: obj.isPublic,
    ownerId: obj.ownerId.toString(),
    ownerName: obj.ownerName,
    memberCount: obj.members.length,
    members: obj.members.map((m) => ({
      userId: m.userId.toString(),
      role: m.role,
      joinedAt: m.joinedAt,
      readingProgress: m.readingProgress,
    })),
    messageCount: obj.messages.length,
    tags: obj.tags,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

/**
 * Format a club summary for list view.
 */
export function formatClubSummary(club) {
  const obj = club.toObject ? club.toObject() : club;
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    genre: obj.genre,
    maxMembers: obj.maxMembers,
    currentBookId: obj.currentBookId,
    currentBookTitle: obj.currentBookTitle,
    isPublic: obj.isPublic,
    ownerId: obj.ownerId.toString(),
    ownerName: obj.ownerName,
    memberCount: obj.members.length,
    tags: obj.tags,
    createdAt: obj.createdAt,
  };
}

/**
 * Check if user is a member of a club.
 */
export function getMemberRecord(club, userId) {
  return club.members.find((m) => m.userId.toString() === userId.toString());
}

/**
 * Check if member has owner or moderator role.
 */
export function hasPrivilegedRole(memberRecord) {
  return memberRecord && (memberRecord.role === 'owner' || memberRecord.role === 'moderator');
}

/**
 * Service: Create a new book club
 */
export async function createClub({ user, name, description, genre, maxMembers, isPublic, tags }) {
  const club = await BookClub.create({
    name,
    description: description || '',
    genre: genre || '',
    maxMembers: maxMembers || 0,
    isPublic: isPublic !== false,
    ownerId: user._id,
    ownerName: user.name,
    members: [
      {
        userId: user._id,
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string').slice(0, 10) : [],
  });

  return formatClub(club);
}

/**
 * Service: List public clubs with search and pagination
 */
export async function listClubs({ q, genre, page = 1, limit = 20 }) {
  const filter = { isPublic: true };

  if (genre) {
    filter.genre = genre;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [clubs, total] = await Promise.all([
    BookClub.find(filter)
      .sort(q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    BookClub.countDocuments(filter),
  ]);

  return {
    clubs: clubs.map((c) => formatClubSummary({ toObject: () => c })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Service: Get clubs user belongs to
 */
export async function getMyClubs(userId) {
  const clubs = await BookClub.find({
    'members.userId': userId,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return clubs.map((c) => formatClubSummary({ toObject: () => c }));
}

/**
 * Service: Get single club by ID with permission checks
 */
export async function getClubById(clubId, currentUser) {
  const club = await BookClub.findById(clubId).lean();

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (!club.isPublic) {
    const isMember = club.members.some(
      (m) => m.userId.toString() === currentUser?._id?.toString()
    );
    if (!isMember) {
      const err = new Error('This club is private');
      err.statusCode = 403;
      throw err;
    }
  }

  const recentMessages = club.messages.slice(-50);

  return {
    ...formatClub({ toObject: () => club }),
    messages: recentMessages.map((m) => ({
      ...m,
      _id: m._id?.toString(),
      authorId: m.authorId.toString(),
    })),
  };
}

/**
 * Service: Update club details
 */
export async function updateClub(clubId, userId, updateData) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (club.ownerId.toString() !== userId.toString()) {
    const err = new Error('Only the owner can update club settings');
    err.statusCode = 403;
    throw err;
  }

  const { name, description, genre, maxMembers, isPublic, tags } = updateData;

  if (name !== undefined) club.name = name;
  if (description !== undefined) club.description = description;
  if (genre !== undefined) club.genre = genre;
  if (maxMembers !== undefined) club.maxMembers = maxMembers;
  if (isPublic !== undefined) club.isPublic = isPublic;
  if (tags !== undefined) {
    club.tags = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string').slice(0, 10) : [];
  }

  await club.save();
  return formatClub(club);
}

/**
 * Service: Delete a club
 */
export async function deleteClub(clubId, userId) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (club.ownerId.toString() !== userId.toString()) {
    const err = new Error('Only the owner can delete the club');
    err.statusCode = 403;
    throw err;
  }

  await BookClub.findByIdAndDelete(clubId);
  return { success: true };
}

/**
 * Service: Join a club
 */
export async function joinClub(clubId, user) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (!club.isPublic) {
    const err = new Error('This club is private. Ask the owner for an invite.');
    err.statusCode = 403;
    throw err;
  }

  const existing = getMemberRecord(club, user._id);
  if (existing) {
    const err = new Error('Already a member of this club');
    err.statusCode = 400;
    throw err;
  }

  if (club.maxMembers > 0 && club.members.length >= club.maxMembers) {
    const err = new Error('Club is full');
    err.statusCode = 400;
    throw err;
  }

  club.members.push({
    userId: user._id,
    role: 'member',
    joinedAt: new Date(),
  });

  await club.save();
  return formatClub(club);
}

/**
 * Service: Leave a club
 */
export async function leaveClub(clubId, userId) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (club.ownerId.toString() === userId.toString()) {
    const err = new Error('Owner cannot leave. Transfer ownership or delete the club.');
    err.statusCode = 400;
    throw err;
  }

  const memberIdx = club.members.findIndex(
    (m) => m.userId.toString() === userId.toString()
  );

  if (memberIdx === -1) {
    const err = new Error('Not a member of this club');
    err.statusCode = 400;
    throw err;
  }

  club.members.splice(memberIdx, 1);
  await club.save();
  return { success: true };
}

/**
 * Service: Remove a member
 */
export async function removeMember(clubId, callerUser, targetUserId) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const caller = getMemberRecord(club, callerUser._id);
  if (!hasPrivilegedRole(caller)) {
    const err = new Error('Only owner or moderator can remove members');
    err.statusCode = 403;
    throw err;
  }

  const targetMember = getMemberRecord(club, targetUserId);
  if (!targetMember) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  if (targetMember.role === 'owner') {
    const err = new Error('Cannot remove the club owner');
    err.statusCode = 400;
    throw err;
  }

  if (caller.role === 'moderator' && targetMember.role === 'moderator') {
    const err = new Error('Moderators cannot remove other moderators');
    err.statusCode = 403;
    throw err;
  }

  club.members = club.members.filter(
    (m) => m.userId.toString() !== targetUserId.toString()
  );

  await club.save();
  return { success: true };
}

/**
 * Service: Transfer ownership
 */
export async function transferOwnership(clubId, currentOwnerId, newOwnerUserId) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  if (club.ownerId.toString() !== currentOwnerId.toString()) {
    const err = new Error('Only the owner can transfer ownership');
    err.statusCode = 403;
    throw err;
  }

  if (!newOwnerUserId) {
    const err = new Error('userId is required');
    err.statusCode = 400;
    throw err;
  }

  const newOwner = getMemberRecord(club, newOwnerUserId);
  if (!newOwner) {
    const err = new Error('New owner must be a member');
    err.statusCode = 404;
    throw err;
  }

  const currentOwner = getMemberRecord(club, currentOwnerId);
  if (currentOwner) {
    currentOwner.role = 'member';
  }

  newOwner.role = 'owner';
  club.ownerId = newOwnerUserId;

  const newUser = await User.findById(newOwnerUserId).select('name').lean();
  club.ownerName = newUser?.name || club.ownerName;

  await club.save();
  return formatClub(club);
}

/**
 * Service: Set current book
 */
export async function setCurrentBook(clubId, user, { bookId, bookTitle }) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const caller = getMemberRecord(club, user._id);
  if (!hasPrivilegedRole(caller)) {
    const err = new Error('Only owner or moderator can set the club book');
    err.statusCode = 403;
    throw err;
  }

  club.currentBookId = bookId;
  club.currentBookTitle = bookTitle;

  for (const member of club.members) {
    member.readingProgress = null;
  }

  await club.save();

  await eventBus.emitAsync(EVENTS.BOOK_CLUB_BOOK_CHANGED, {
    clubId: club._id.toString(),
    clubName: club.name,
    bookId,
    bookTitle,
    memberUserIds: club.members.map((m) => m.userId.toString()),
  });

  return formatClub(club);
}

/**
 * Service: Update progress
 */
export async function updateProgress(clubId, userId, progress) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const member = getMemberRecord(club, userId);
  if (!member) {
    const err = new Error('Not a member of this club');
    err.statusCode = 403;
    throw err;
  }

  if (!club.currentBookId) {
    const err = new Error('No club book set yet');
    err.statusCode = 400;
    throw err;
  }

  if (progress === undefined || progress < 0 || progress > 100) {
    const err = new Error('Progress must be between 0 and 100');
    err.statusCode = 400;
    throw err;
  }

  member.readingProgress = progress;
  await club.save();

  return member.readingProgress;
}

/**
 * Service: Send message
 */
export async function sendMessage(clubId, user, { content, bookId }) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const member = getMemberRecord(club, user._id);
  if (!member) {
    const err = new Error('Not a member of this club');
    err.statusCode = 403;
    throw err;
  }

  const message = {
    authorId: user._id,
    authorName: user.name,
    content,
    bookId: bookId || null,
  };

  club.messages.push(message);

  if (club.messages.length > 500) {
    club.messages = club.messages.slice(-500);
  }

  await club.save();

  const savedMsg = club.messages[club.messages.length - 1];
  return {
    _id: savedMsg._id?.toString(),
    authorId: savedMsg.authorId.toString(),
    authorName: savedMsg.authorName,
    content: savedMsg.content,
    bookId: savedMsg.bookId,
    createdAt: savedMsg.createdAt,
  };
}

/**
 * Service: Delete message
 */
export async function deleteMessage(clubId, messageId, user) {
  const club = await BookClub.findById(clubId);

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const member = getMemberRecord(club, user._id);
  if (!member) {
    const err = new Error('Not a member of this club');
    err.statusCode = 403;
    throw err;
  }

  const msgIdx = club.messages.findIndex(
    (m) => m._id?.toString() === messageId
  );

  if (msgIdx === -1) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }

  const msg = club.messages[msgIdx];
  const isAuthor = msg.authorId.toString() === user._id.toString();
  const isPrivileged = hasPrivilegedRole(member);

  if (!isAuthor && !isPrivileged) {
    const err = new Error('Not authorised to delete this message');
    err.statusCode = 403;
    throw err;
  }

  club.messages.splice(msgIdx, 1);
  await club.save();
  return { success: true };
}

/**
 * Service: Get club reading stats
 */
export async function getClubStats(clubId, currentUser) {
  const club = await BookClub.findById(clubId).lean();

  if (!club) {
    const err = new Error('Club not found');
    err.statusCode = 404;
    throw err;
  }

  const isMember = club.members.some(
    (m) => m.userId.toString() === currentUser?._id?.toString()
  );

  if (!isMember) {
    const err = new Error('Not a member of this club');
    err.statusCode = 403;
    throw err;
  }

  const members = club.members;
  const totalMembers = members.length;
  const membersReading = members.filter((m) => m.readingProgress !== null);
  const avgProgress =
    membersReading.length > 0
      ? Math.round(
          membersReading.reduce((sum, m) => sum + m.readingProgress, 0) /
            membersReading.length
        )
      : 0;
  const membersFinished = membersReading.filter((m) => m.readingProgress === 100).length;

  return {
    totalMembers,
    membersReading: membersReading.length,
    membersFinished,
    avgProgress,
    currentBookId: club.currentBookId,
    currentBookTitle: club.currentBookTitle,
    members: members.map((m) => ({
      userId: m.userId.toString(),
      role: m.role,
      readingProgress: m.readingProgress,
    })),
  };
}

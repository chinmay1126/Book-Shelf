import * as bookClubService from '../services/bookClubService.js';

export const createClub = async (req, res, next) => {
  try {
    const club = await bookClubService.createClub({
      user: req.user,
      ...req.body,
    });
    res.status(201).json({ message: 'Club created', club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const listClubs = async (req, res, next) => {
  try {
    const data = await bookClubService.listClubs(req.query);
    res.json(data);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getMyClubs = async (req, res, next) => {
  try {
    const clubs = await bookClubService.getMyClubs(req.user._id);
    res.json({ clubs });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getClub = async (req, res, next) => {
  try {
    const club = await bookClubService.getClubById(req.params.id, req.user);
    res.json({ club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateClub = async (req, res, next) => {
  try {
    const club = await bookClubService.updateClub(req.params.id, req.user._id, req.body);
    res.json({ message: 'Club updated', club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteClub = async (req, res, next) => {
  try {
    await bookClubService.deleteClub(req.params.id, req.user._id);
    res.json({ message: 'Club deleted' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const joinClub = async (req, res, next) => {
  try {
    const club = await bookClubService.joinClub(req.params.id, req.user);
    res.json({ message: 'Joined the club', club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const leaveClub = async (req, res, next) => {
  try {
    await bookClubService.leaveClub(req.params.id, req.user._id);
    res.json({ message: 'Left the club' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    await bookClubService.removeMember(req.params.id, req.user, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const transferOwnership = async (req, res, next) => {
  try {
    const club = await bookClubService.transferOwnership(req.params.id, req.user._id, req.body.userId);
    res.json({ message: 'Ownership transferred', club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const setCurrentBook = async (req, res, next) => {
  try {
    const club = await bookClubService.setCurrentBook(req.params.id, req.user, req.body);
    res.json({ message: 'Club book updated', club });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const readingProgress = await bookClubService.updateProgress(req.params.id, req.user._id, req.body.progress);
    res.json({ message: 'Progress updated', readingProgress });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const msg = await bookClubService.sendMessage(req.params.id, req.user, req.body);
    res.status(201).json({ message: 'Message posted', msg });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    await bookClubService.deleteMessage(req.params.id, req.params.messageId, req.user);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getClubStats = async (req, res, next) => {
  try {
    const stats = await bookClubService.getClubStats(req.params.id, req.user);
    res.json(stats);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export default {
  createClub,
  listClubs,
  getMyClubs,
  getClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  removeMember,
  transferOwnership,
  setCurrentBook,
  updateProgress,
  sendMessage,
  deleteMessage,
  getClubStats,
};

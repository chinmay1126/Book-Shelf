import * as priceAlertService from '../services/priceAlertService.js';

export const createAlert = async (req, res, next) => {
  try {
    const result = await priceAlertService.createAlert(req.user._id, req.body);
    const status = result.isUpdate ? 200 : 201;
    res.status(status).json({
      message: result.message,
      alert: result.alert,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await priceAlertService.getMyAlerts(req.user._id, req.query);
    res.json(alerts);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const checkAlert = async (req, res, next) => {
  try {
    const result = await priceAlertService.checkAlert(req.user._id, req.params.bookId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const toggleAlert = async (req, res, next) => {
  try {
    const result = await priceAlertService.toggleAlert(req.params.alertId, req.user._id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const result = await priceAlertService.updateAlert(
      req.params.alertId,
      req.user._id,
      req.body.targetPrice
    );
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const result = await priceAlertService.deleteAlert(req.params.alertId, req.user._id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteByBookId = async (req, res, next) => {
  try {
    const result = await priceAlertService.deleteByBookId(req.user._id, req.params.bookId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const checkAllAlerts = async (req, res, next) => {
  try {
    const result = await priceAlertService.checkAllAlerts();
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export default {
  createAlert,
  getMyAlerts,
  checkAlert,
  toggleAlert,
  updateAlert,
  deleteAlert,
  deleteByBookId,
  checkAllAlerts,
};

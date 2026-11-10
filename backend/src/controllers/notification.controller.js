import * as notificationService from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.status(200).json({ status: "success", data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({ status: "success", data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

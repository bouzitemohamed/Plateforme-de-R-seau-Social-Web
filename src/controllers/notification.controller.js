const Notification = require('../models/notification.model');
const responseHandler = require('../utils/responseHandler');
const { statusCodes } = require('../utils/statusCodes');
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadNotifications = await Notification.find({ receiver: userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('thread', 'content');

    return responseHandler.success(res, unreadNotifications, "Unread notifications fetched successfully", statusCodes.SUCCESS);
  } catch (error) {
    console.error("Get unread notifications error:", error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getUnreadNotifications
};

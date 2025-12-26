const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getUnreadNotifications } = require('../controllers/notification.controller');

router.get('/unread', authMiddleware, getUnreadNotifications);

module.exports = router;

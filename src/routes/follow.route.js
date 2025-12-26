const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { sendFollowRequest , acceptFollowRequest } = require('../controllers/follower.controller');

router.post('/follow', authMiddleware, sendFollowRequest);
router.patch('/accept', authMiddleware, acceptFollowRequest);
module.exports = router;

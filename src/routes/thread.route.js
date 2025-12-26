const express = require("express");
const router = express.Router();
const validate = require('../middlewares/validate');
const threadSchema=require("../validators/threadSchema");
const { createThread,getUserThreads ,getThreadById,updateThread,archiveThread ,getPublicThreads } = require("../controllers/thread.controller");
const authMiddleware = require("../middlewares/auth");
const pagination=require("../middlewares/pagination");
const upload = require("../middlewares/avatarUpload"); 


router.post(
  "/",
  authMiddleware,         
  upload.single("media"), 
  validate(threadSchema),
  createThread
);
router.get('/me', authMiddleware, pagination, getUserThreads);
router.get('/me/:threadId', authMiddleware, getThreadById);
router.patch('/me/:threadId', authMiddleware,upload.single('file'), updateThread);
router.patch('/archive/:threadId', authMiddleware, archiveThread);
router.get('/public', pagination, getPublicThreads);
module.exports = router;

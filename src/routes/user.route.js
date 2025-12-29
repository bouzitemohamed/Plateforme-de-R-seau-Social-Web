const express = require("express");
const router = express.Router();
const authenticate  = require("../middlewares/auth");
const {updateProfile}=require("../controllers/user.controller");
const upload = require("../middlewares/avatarUpload"); 
router.patch(
  '/me',
  authenticate,
  upload.single('avatar'),
  updateProfile
);

module.exports = router;

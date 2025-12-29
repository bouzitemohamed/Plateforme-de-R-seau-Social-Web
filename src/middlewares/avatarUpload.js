const multer = require("multer");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new Error("No file received"));
    }

    // Allow images and videos
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Only image and video files are allowed"));
    }

    cb(null, true);
  }
});

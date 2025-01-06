const express = require("express");
const movieController = require("../controllers/movieController");
const protect = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with extension
  },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png file types are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

router.route("/getAllMovies").get(movieController.getAllMovies);
router.route("/getOneMovie/:id").get(movieController.getOneMovie);
router.route("/create").post(upload.single("image"), movieController.create);
router
  .route("/update/:id")
  .patch(upload.single("image"), movieController.update);

module.exports = router;

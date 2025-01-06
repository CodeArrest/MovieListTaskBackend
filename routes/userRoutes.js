const express = require("express");
const authController = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(protect, authController.allUser);
router.route("/login").post(authController.login);
router.route("/register").post(authController.create);

module.exports = router;

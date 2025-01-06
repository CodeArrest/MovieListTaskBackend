const jwt = require("jsonwebtoken");
const Users = require("../models/UserModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Users.findById(decoded.key).select("-password");

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, Token invalid" });
    }
  }
});

module.exports = protect;

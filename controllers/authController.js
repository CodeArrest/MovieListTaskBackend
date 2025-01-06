const asyncHandler = require("express-async-handler");
const Users = require("../models/UserModel");
const generateToken = require("../CONFIG/generateToken");
const bcrypt = require("bcrypt");

//API to create new user

exports.create = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json("Please Fill all the fields");
    }

    const userExists = await Users.findOne({ email });

    if (userExists) {
      return res.status(400).json("User already exist with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
      pic,
    });

    if (user) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        accessToken: generateToken(user._id),
      });
    } else {
      return res.status(500).json({ message: "Internal server Error" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("All fields are required");
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json("User does not exist with this email");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json("Invalid Passord");
      }

      const { _id, name, email, pic } = user;

      return res.status(200).json({
        message: "User Logged in",
        user: { _id, name, email, pic },
        accessToken: generateToken(_id),
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//  API to search all users using a search query

exports.allUser = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await Users.find(keyword).find({
      _id: { $ne: req.user._id },
    });

    return res.send(users);
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.logout = asyncHandler(async (req, res) => {});

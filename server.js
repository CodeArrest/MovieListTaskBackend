const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./CONFIG/db");
const userRoutes = require("./routes/userRoutes");
const moviesRoutes = require("./routes/movieRoutes");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();
dotenv.config();

connectDB();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/movies", moviesRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

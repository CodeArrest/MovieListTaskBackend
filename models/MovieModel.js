const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    publishingYear: {
      type: Number,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // creates the fields updatedAt and createdAt
  }
);

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;

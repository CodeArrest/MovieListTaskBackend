const Movie = require("../models/MovieModel");
const asyncHandler = require("express-async-handler");

exports.getAllMovies = asyncHandler(async (req, res) => {
  try {
    const { title, year, page = 1, limit = 8 } = req.query;

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid page number. It must be a positive integer." });
    }

    if (isNaN(pageSize) || pageSize <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid limit. It must be a positive integer." });
    }

    // Build query based on optional filters
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Case-insensitive search
    }
    if (year) {
      const yearNumber = parseInt(year, 10);
      if (isNaN(yearNumber)) {
        return res
          .status(400)
          .json({ error: "Invalid year. It must be a number." });
      }
      query.year = yearNumber;
    }

    // Fetch movies with pagination
    const movies = await Movie.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Get the total count for pagination metadata
    const totalMovies = await Movie.countDocuments(query);

    // Handle empty results
    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found matching the criteria." });
    }

    // Response
    res.status(200).json({
      message: "Movies retrieved successfully",
      data: movies,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / pageSize),
        totalMovies,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching movies.",
      details: error.message,
    });
  }
});

// Create movie API
exports.create = asyncHandler(async (req, res) => {
  try {
    const { title, year } = req.body;

    console.log("Title", title, year);

    // Validate input
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string." });
    }
    if (!year || isNaN(Number(year))) {
      return res
        .status(400)
        .json({ error: "Publishing year is required and must be a number." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Poster image is required." });
    }

    // Poster file path
    const posterUrl = `/uploads/${req.file.filename}`;

    // Check for duplicate movie (by title and publishing year)
    const existingMovie = await Movie.findOne({ title, publishingYear: year });
    if (existingMovie) {
      return res.status(409).json({
        error:
          "A movie with the same title and publishing year already exists.",
      });
    }

    // Create the movie
    const movie = await Movie.create({
      title,
      publishingYear: Number(year),
      poster: posterUrl,
    });

    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while adding the movie.",
      details: error.message,
    });
  }
});

exports.update = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const year = parseInt(req.body.year);

    // Validate input
    if (title && typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title must be a string if provided." });
    }
    if (year && typeof year !== "number") {
      return res
        .status(400)
        .json({ error: "Publishing year must be a number if provided." });
    }

    // Check if movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    // Update fields
    movie.title = title ?? movie.title;
    movie.publishingYear = year ?? movie.publishingYear;

    // Handle image upload
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      movie.poster = imagePath;
    }

    const updatedMovie = await movie.save();
    res
      .status(200)
      .json({ message: "Movie updated successfully", movie: updatedMovie });
  } catch (error) {
    // Handle invalid IDs
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid movie ID format." });
    }

    res.status(500).json({
      error: "An error occurred while updating the movie.",
      details: error.message,
    });
  }
});

exports.getOneMovie = asyncHandler(async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    // console.log("Movie", movie);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the movie." });
  }
});

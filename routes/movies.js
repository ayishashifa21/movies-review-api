const express = require("express");
const fs = require("fs");
const router = express.Router();
const filePath = "movies.json";

// Read file helper
const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// --- Task 1: Add movie review (POST) ---
router.post("/", (req, res) => {
    const { movieTitle, director, reviewText, rating, tags } = req.body;

    if (!movieTitle || !director || !reviewText || !rating) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const movies = readData();

    const duplicate = movies.find(
        (m) =>
            m.movieTitle === movieTitle &&
            m.director === director &&
            m.user === req.headers['authorization']
    );

    if (duplicate) {
        return res.status(409).json({ error: "Duplicate review" });
    }

    const newReview = {
        id: Date.now().toString(),
        movieTitle,
        director,
        reviewText,
        rating,
        tags: tags || [],
        user: req.headers['authorization'],
        date: new Date().toISOString()
    };

    movies.push(newReview);
    writeData(movies);

    res.json(newReview);
});

// --- Task 2: Get all reviews with filters ---
router.get("/", (req, res) => {
    let movies = readData();
    const { director, rating, tag, sort, date } = req.query;

    if (director) movies = movies.filter(m => m.director === director);
    if (rating) movies = movies.filter(m => m.rating == rating);
    if (tag) movies = movies.filter(m => m.tags.includes(tag));

    // Sorting
    if (sort === "rating") {
        movies.sort((a, b) => b.rating - a.rating);
    } else if (date === "asc") {
        movies.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (date === "desc") {
        movies.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    res.json(movies);
});

// --- Task 3: Update (PUT) ---
router.put("/:id", (req, res) => {
    const { reviewText, rating, tags } = req.body;
    const movies = readData();

    const review = movies.find(r => r.id === req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.user !== req.headers['authorization'])
        return res.status(403).json({ error: "Not allowed" });

    review.reviewText = reviewText || review.reviewText;
    review.rating = rating || review.rating;
    review.tags = tags || review.tags;

    writeData(movies);
    res.json(review);
});

// --- Task 4: Delete (DELETE) ---
router.delete("/:id", (req, res) => {
    const movies = readData();
    const review = movies.find(r => r.id === req.params.id);

    if (!review) return res.status(404).json({ error: "Not found" });

    if (review.user !== req.headers['authorization'])
        return res.status(403).json({ error: "Forbidden" });

    const updated = movies.filter(r => r.id !== req.params.id);
    writeData(updated);

    res.json({ message: "Review deleted" });
});

module.exports = router;

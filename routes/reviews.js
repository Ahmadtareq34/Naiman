const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get average rating per saloon
router.get("/averages", (req, res) => {
  const query = `
    SELECT saloon_id, AVG(rating) as avg_rating
    FROM reviews
    GROUP BY saloon_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const averages = {};
    results.forEach((row) => {
      averages[row.saloon_id] = row.avg_rating;
    });

    res.json(averages);
  });
});

// Submit a new review
router.post("/", (req, res) => {
  const { user_id, saloon_id, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  const sql = `
    INSERT INTO reviews (user_id, saloon_id, rating, comment) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, saloon_id, rating, comment], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true, message: "Review added!" });
  });
});

// Get reviews for a specific saloon (only rating and comment)
router.get("/:saloon_id", (req, res) => {
  const saloonId = req.params.saloon_id;
  const query = `
    SELECT rating, comment 
    FROM reviews 
    WHERE saloon_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [saloonId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;

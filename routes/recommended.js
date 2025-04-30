const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Route to get top 2 recommended saloons per category based on average rating
router.get("/", (req, res) => {
  const query = `
    SELECT 
      s.id, 
      s.name, 
      s.category, 
      s.location, 
      s.contact, 
      s.image_path,
      IFNULL(AVG(r.rating), 0) AS avg_rating
    FROM saloons s
    LEFT JOIN reviews r ON s.id = r.saloon_id
    GROUP BY s.id
    ORDER BY s.category, avg_rating DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const topSaloons = {};

    // Group and limit to top 2 per category
    results.forEach((salon) => {
      if (!topSaloons[salon.category]) {
        topSaloons[salon.category] = [];
      }

      if (topSaloons[salon.category].length < 2) {
        topSaloons[salon.category].push(salon);
      }
    });

    res.json(topSaloons);
  });
});

module.exports = router;

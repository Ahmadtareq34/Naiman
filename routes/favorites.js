const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get grouped favorites for the favorites.html page
router.get("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;

  const query = `
    SELECT 
      s.id AS saloon_id,
      s.name AS saloon_name,
      s.location,
      s.contact,
      s.image_path,
      s.category
    FROM favorites f
    JOIN saloons s ON f.saloon_id = s.id
    WHERE f.user_id = ?
    ORDER BY s.category, s.name
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push({
        id: row.saloon_id,
        name: row.saloon_name,
        location: row.location,
        contact: row.contact,
        image: row.image_path,
      });
    });

    res.json(grouped);
  });
});

// Get only saloon IDs (for use in barbershop.html, etc.)
router.get("/ids", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json([]); 
  }

  const userId = req.session.user.id;

  const query = `SELECT saloon_id FROM favorites WHERE user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const ids = results.map(r => r.saloon_id);
    res.json(ids);
  });
});

// Add to favorites
router.post("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;
  const { saloon_id } = req.body;

  if (!saloon_id) {
    return res.status(400).json({ error: "saloon_id is required" });
  }

  const query = `INSERT IGNORE INTO favorites (user_id, saloon_id) VALUES (?, ?)`;

  db.query(query, [userId, saloon_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true, message: "Added to favorites" });
  });
});

// Remove from favorites
router.delete("/:saloon_id", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;
  const saloonId = req.params.saloon_id;

  const query = `DELETE FROM favorites WHERE user_id = ? AND saloon_id = ?`;

  db.query(query, [userId, saloonId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true, message: "Removed from favorites" });
  });
});

module.exports = router;

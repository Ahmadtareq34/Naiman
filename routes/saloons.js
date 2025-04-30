const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Fetch all shops by category
router.get("/:category", (req, res) => {
    const category = req.params.category;
    db.query("SELECT * FROM saloons WHERE category = ?", [category], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Fetch single shop details
router.get("/details/:id", (req, res) => {
    const saloonId = req.params.id;
    db.query("SELECT * FROM saloons WHERE id = ?", [saloonId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Shop not found" });
        res.json(results[0]);
    });
});

// Fetch services for a shop
router.get("/:id/services", (req, res) => {
    const saloonId = req.params.id;
    db.query("SELECT * FROM services WHERE saloon_id = ?", [saloonId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;

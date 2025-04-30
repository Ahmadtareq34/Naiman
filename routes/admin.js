const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== Image Upload Config =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../images");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "salon-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage: storage });

// ===== Admin Login =====
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const sql = "SELECT * FROM admin WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    req.session.admin = { id: admin.id, email: admin.email };
    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: "Session error." });

      res.json({ success: true, redirect: "/admin/admin.html" });
    });
  });
});

// ===== Admin Session Status =====
router.get("/status", (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ loggedIn: true, email: req.session.admin.email });
  }
  return res.json({ loggedIn: false });
});

// ===== Admin Logout =====
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: "Logout error." });
    res.json({ success: true });
  });
});

// ===== Get Dashboard Stats =====
router.get("/metrics", (req, res) => {
  const stats = {};
  db.query("SELECT COUNT(*) AS count FROM saloons", (err, result1) => {
    if (err) return res.status(500).json({ success: false, message: "Stats error." });

    stats.totalSalons = result1[0].count;

    db.query("SELECT COUNT(*) AS count FROM reviews", (err, result2) => {
      if (err) return res.status(500).json({ success: false, message: "Stats error." });

      stats.totalReviews = result2[0].count;
      res.json(stats);
    });
  });
});

// ===== Add New Salon =====
router.post("/add-salon", upload.single("image"), (req, res) => {
  const { name, category, location, contact, description } = req.body;
  let services = req.body.services;

  // Format contact to: +974 XXXX XXXX
  const cleanedContact = contact.replace(/\D/g, "").slice(-8); // last 8 digits
  const formattedContact = `+974 ${cleanedContact.slice(0, 4)} ${cleanedContact.slice(4)}`;

  const imagePath = "/images/" + req.file.filename;

  const insertSalonQuery = `
    INSERT INTO saloons (name, category, location, contact, image_path, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSalonQuery,
    [name, category, location, formattedContact, imagePath, description],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding salon." });

      const saloonId = result.insertId;

      let serviceArray = [];
      try {
        if (typeof services === "string") {
          serviceArray = JSON.parse(services);
        } else {
          serviceArray = services;
        }
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid services format." });
      }

      if (!Array.isArray(serviceArray) || serviceArray.length === 0) {
        return res.status(400).json({ success: false, message: "No services provided." });
      }

      const values = serviceArray
        .slice(0, 5)
        .map((s) => [saloonId, s.name, s.price]);

      const insertServicesQuery = `
        INSERT INTO services (saloon_id, service_name, price)
        VALUES ?
      `;

      db.query(insertServicesQuery, [values], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Error adding services." });

        res.json({ success: true, message: "Salon and services added successfully!" });
      });
    }
  );
});

module.exports = router;

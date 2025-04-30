const express = require("express");
const db = require("../config/db"); 
const bcrypt = require("bcrypt");
const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, message: ["All fields are required"] });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [first_name, last_name, email, hashedPassword], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: ["Error saving the user"] });
      }
      res.json({ success: true, redirect: "/login/login.html" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: ["Server error"] });
  }
});

// User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: ["All fields are required"] });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: ["Server error"] });

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: ["Invalid email or password"] });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: ["Invalid email or password"] });
    }

    req.session.user = { id:user.id, email: user.email };
    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: ["Error saving session"] });

      console.log("Session saved successfully:", req.session.user);
      res.json({ success: true, redirect: "/home/index.html" });
    });
  });
});

// User Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: "Error logging out" });

    res.json({ success: true });
  });
});

// User Session Check
router.get("/user-status", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, id: req.session.user.id, email: req.session.user.email });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;

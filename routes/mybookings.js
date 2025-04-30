const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Required middleware to parse incoming form data
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// ===== Middleware to check if user is logged in =====
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// ===== GET CURRENT & PAST BOOKINGS =====
router.get("/user-bookings", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const now = new Date();

  const query = `
    SELECT 
      b.id AS booking_id,
      b.appointment_datetime,
      b.appointment_end,
      b.created_at,
      s.id AS saloon_id,
      s.name AS saloon_name,
      s.image_path,
      s.category,
      s.location,
      GROUP_CONCAT(se.service_name SEPARATOR ', ') AS services,
      SUM(se.price) AS total_price,
      (SELECT COUNT(*) FROM reviews r WHERE r.booking_id = b.id) AS has_review
    FROM bookings b
    JOIN saloons s ON b.saloon_id = s.id
    JOIN booking_services bs ON bs.booking_id = b.id
    JOIN services se ON se.id = bs.service_id
    WHERE b.user_id = ?
    GROUP BY b.id
    ORDER BY b.appointment_datetime DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }

    const current = [];
    const past = [];

    results.forEach((booking) => {
      const bookingDate = new Date(booking.appointment_datetime);
      const formattedBooking = {
        ...booking,
        services: booking.services ? booking.services.split(", ") : [],
        price: booking.total_price,
        has_review: booking.has_review > 0
      };

      if (bookingDate < now) {
        past.push(formattedBooking);
      } else {
        current.push(formattedBooking);
      }
    });

    res.json({ success: true, current, past });
  });
});

// ===== SUBMIT REVIEW =====
router.post("/submit-review", isAuthenticated, (req, res) => {
  let { booking_id, rating, comment } = req.body;
  const userId = req.session.user.id;

  console.log("RECEIVED REVIEW SUBMISSION:", {
    booking_id,
    rating,
    comment,
    userId,
  });

  booking_id = parseInt(booking_id);
  rating = parseInt(rating);
  comment = comment?.trim();

  if (
    isNaN(booking_id) ||
    isNaN(rating) ||
    rating < 1 ||
    rating > 5 ||
    !comment
  ) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  const checkQuery = "SELECT * FROM reviews WHERE booking_id = ?";
  db.query(checkQuery, [booking_id], (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: "Error checking reviews" });

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Review already submitted for this booking" });
    }

    const getSaloonIdQuery = "SELECT saloon_id FROM bookings WHERE id = ? AND user_id = ?";
    db.query(getSaloonIdQuery, [booking_id, userId], (err2, bookingRows) => {
      if (err2 || bookingRows.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid booking" });
      }

      const saloonId = bookingRows[0].saloon_id;

      const insertQuery = `
        INSERT INTO reviews (user_id, saloon_id, booking_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertQuery, [userId, saloonId, booking_id, rating, comment], (err3) => {
        if (err3) {
          return res.status(500).json({ success: false, message: "Error saving review" });
        }

        res.json({ success: true, message: "Review submitted successfully" });
      });
    });
  });
});

module.exports = router;

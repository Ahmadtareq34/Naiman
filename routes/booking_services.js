const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get services booked for a specific booking
router.get("/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  const query = `
    SELECT s.id, s.service_name, s.price
    FROM booking_services bs
    JOIN services s ON bs.service_id = s.id
    WHERE bs.booking_id = ?
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Delete a service from a booking
router.delete("/:bookingId/:serviceId", (req, res) => {
  const { bookingId, serviceId } = req.params;

  const query = `DELETE FROM booking_services WHERE booking_id = ? AND service_id = ?`;
  db.query(query, [bookingId, serviceId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found in booking." });
    }

    res.json({ success: true, message: "Service removed from booking." });
  });
});

module.exports = router;

const express = require("express");
const db = require("../config/db");
const router = express.Router();
const nodemailer = require("nodemailer");
const { DateTime } = require("luxon");
require("dotenv").config();

// Get unavailable booking times
router.get("/unavailable", (req, res) => {
  const { saloon_id, date } = req.query;

  if (!saloon_id || !date) {
    return res.status(400).json({ error: "Missing salon ID or date." });
  }

  const query = `
    SELECT 
      TIME_FORMAT(appointment_datetime, '%H:%i') AS start,
      TIME_FORMAT(appointment_end, '%H:%i') AS end
    FROM bookings
    WHERE saloon_id = ? AND DATE(appointment_datetime) = ?
  `;

  db.query(query, [saloon_id, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const bookedSlots = results.map(row => ({
      start: row.start,
      end: row.end
    }));

    res.json(bookedSlots);
  });
});

// Create Booking (from confirmation page)
router.post("/", (req, res) => {
  const { user_id, saloon_id, services, appointment_datetime } = req.body;

  if (!user_id || !saloon_id || !appointment_datetime || !Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  // Convert booking datetime to Asia/Qatar
  const bookingStart = DateTime.fromFormat(appointment_datetime, "yyyy-MM-dd HH:mm:ss", { zone: "Asia/Qatar" });
  const totalDuration = services.length * 30;
  const bookingEnd = bookingStart.plus({ minutes: totalDuration });

  const formattedStart = bookingStart.toFormat("yyyy-MM-dd HH:mm:ss");
  const formattedEnd = bookingEnd.toFormat("yyyy-MM-dd HH:mm:ss");

  const overlapQuery = `
    SELECT * FROM bookings
    WHERE saloon_id = ?
      AND (
        (appointment_datetime < ? AND appointment_end > ?)
        OR
        (appointment_datetime >= ? AND appointment_datetime < ?)
      )
  `;

  db.query(
    overlapQuery,
    [saloon_id, formattedEnd, formattedStart, formattedStart, formattedEnd],
    (err, overlapping) => {
      if (err) return res.status(500).json({ error: err.message });

      if (overlapping.length > 0) {
        return res.status(400).json({ error: "Time slot unavailable. Please choose another time." });
      }

      const insertBookingQuery = `
        INSERT INTO bookings (user_id, saloon_id, appointment_datetime, appointment_end, status)
        VALUES (?, ?, ?, ?, 'confirmed')
      `;

      db.query(insertBookingQuery, [user_id, saloon_id, formattedStart, formattedEnd], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const bookingId = result.insertId;

        const serviceInsertQuery = `
          INSERT INTO booking_services (booking_id, service_id) VALUES ?
        `;
        const serviceValues = services.map(service_id => [bookingId, service_id]);

        db.query(serviceInsertQuery, [serviceValues], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          const userQuery = `SELECT email FROM users WHERE id = ?`;
          db.query(userQuery, [user_id], (err, users) => {
            if (err || users.length === 0) {
              return res.json({ success: true, message: "Booking confirmed without email.", bookingId });
            }

            const userEmail = users[0].email;

            const saloonQuery = `SELECT name FROM saloons WHERE id = ?`;
            db.query(saloonQuery, [saloon_id], (err, saloons) => {
              const saloonName = saloons.length ? saloons[0].name : "Salon";

              const serviceQuery = `
                SELECT service_name, price
                FROM services
                WHERE id IN (?)
              `;
              db.query(serviceQuery, [services], (err, serviceRows) => {
                if (err) return res.status(500).json({ error: err.message });

                let total = 0;
                const serviceList = serviceRows.map(s => {
                  total += Number(s.price);
                  return `<li>${s.service_name} - ${s.price} QAR</li>`;
                }).join("");

                const transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                  }
                });

                const mailOptions = {
                  from: process.env.EMAIL_USER,
                  to: userEmail,
                  subject: "Booking Confirmation - Naiman 💈",
                  html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                      <h2 style="color: maroon;">🎉 Your Booking is Confirmed!</h2>
                      <p><strong>Salon:</strong> ${saloonName}</p>
                      <p><strong>Date:</strong> ${bookingStart.toFormat("yyyy-MM-dd")}</p>
                      <p><strong>Time:</strong> ${bookingStart.toFormat("HH:mm")}</p>
                      <p><strong>Duration:</strong> ${totalDuration} minutes</p>
                      <p><strong>Services:</strong></p>
                      <ul>${serviceList}</ul>
                      <p><strong>Total Price:</strong> ${total.toFixed(2)} QAR</p>
                      <hr />
                      <p style="font-size: 14px; color: #555;">Thanks for booking with <b>Naiman</b>! See you soon 💈</p>
                    </div>
                  `
                };

                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                    console.error("Email error:", err);
                  } else {
                    console.log("Email sent to", userEmail);
                  }
                });

                res.json({
                  success: true,
                  message: "Booking confirmed!",
                  bookingId
                });
              });
            });
          });
        });
      });
    }
  );
});

// Cancel Booking
router.delete("/:id", (req, res) => {
  const bookingId = req.params.id;

  if (!bookingId) {
    return res.status(400).json({ error: "Booking ID is required." });
  }

  const deleteQuery = `DELETE FROM bookings WHERE id = ?`;

  db.query(deleteQuery, [bookingId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }

    res.json({ success: true, message: "Booking canceled successfully." });
  });
});

module.exports = router;

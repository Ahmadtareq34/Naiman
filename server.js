// Import necessary modules
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config(); // Load environment variables

const db = require("./config/db"); // Ensure database connection

// Import Routes
const authRoutes = require("./routes/authRoutes");
const saloonRoutes = require("./routes/saloons");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const favoriteRoutes = require("./routes/favorites");
const bookingServicesRoutes = require("./routes/booking_services");
const recommendedRoutes = require("./routes/recommended");
const adminRoutes = require("./routes/admin");
const myBookingsRoutes = require("./routes/mybookings");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5500",
  credentials: true
}));

app.use(express.static(__dirname));

// Serve static images
app.use("/images", express.static(path.join(__dirname, "images")));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Use Routes
app.use("/auth", authRoutes);
app.use("/saloons", saloonRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/booking-services", bookingServicesRoutes);
app.use("/recommended", recommendedRoutes);
app.use("/admin", adminRoutes);
app.use("/mybookings", myBookingsRoutes);

// Serve home/index.html as the landing page when user visits "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home", "index.html"));
});

// Export app for testing OR start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  module.exports = app;
}

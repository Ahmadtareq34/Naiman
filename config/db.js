const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
  throw new Error("❌ Missing one or more required DB environment variables (DB_HOST, DB_USER, DB_PASS, DB_NAME)");
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL Database");
});

module.exports = db;

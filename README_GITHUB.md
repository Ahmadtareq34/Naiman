# 💈 Naiman – Self-Care Booking Platform

Naiman is a comprehensive self-care service booking platform designed to simplify the process of discovering, favoriting, and booking appointments at various self-care venues such as barbershops, nail salons, skincare centers, spas, and more. The platform includes both user-facing and admin functionalities, enabling customers to schedule services and business owners to manage offerings and bookings.

---

## 📦 Installation Instructions (Local Setup)

To run this project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahmadtareq34/Naiman.git
   cd Naiman
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and configure the following:
   ```env
   PORT=3000
   SESSION_SECRET=yourStrongSecret
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=naiman
   CLIENT_URL=http://localhost:5500
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Serve the frontend** using a live server extension or host it using Netlify or any static site server. The default homepage is located at:
   ```
   /home/index.html
   ```

---

## 📋 Dependencies

### Backend
- **Node.js** v18 or later
- **Express.js** ^4.18
- **MySQL2** ^3.3
- **express-session** ^1.17
- **cors** ^2.8
- **body-parser** ^1.20
- **dotenv** ^16

### Database
- MySQL (Tested with MySQL v8.0)

### Frontend
- HTML/CSS/JavaScript
- Hosted via Netlify or static file server

### Hosting Requirements
- Any system capable of running Node.js and MySQL
- Internet connection for deployed use

---

## 🚀 Deployed Version

The Naiman platform is live:

- **Frontend:** [https://naiman.netlify.app](https://naiman.netlify.app)
- **Backend API:** [https://naiman.onrender.com](https://naiman.onrender.com)

---

## 🔐 Sample Accounts

### User Login
- **Email:** `sampleuser100@gmail.com`
- **Password:** `Sampleuser123!`

### Admin Login
- **Email:** `admin@naiman.com`
- **Password:** `AdminPass123!`
(*If your database is configured accordingly.*)
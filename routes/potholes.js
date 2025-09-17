// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const potholeRoutes = require("./routes/potholes");

const app = express();
const PORT = process.env.PORT || 8080;

// ------------------
// Middleware
// ------------------
app.use(cors());
app.use(express.json());

// ------------------
// Uploads folder setup
// ------------------
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, "uploads");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload folder at:", uploadDir);
} else {
  console.log("✅ Upload folder exists at:", uploadDir);
}

// Serve uploaded files statically at /uploads
//paste

// ------------------
// Routes
// ------------------
app.use("/api/potholes", potholeRoutes);

// ------------------
// Health check route
// ------------------
app.get("/", (req, res) => {
  res.send("🚀 FixMyStreet Backend is running!");
});

// ------------------
// Error handling
// ------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ------------------
// 404 handler
// ------------------
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ------------------
// Start server
// ------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

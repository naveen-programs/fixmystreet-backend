const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const potholeRoutes = require("./routes/potholes");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/potholes", potholeRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 FixMyStreet Backend is running!");
});

// Error handling middleware (catches thrown errors)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  // Default status code
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// 404 handler (if no route matches)
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);

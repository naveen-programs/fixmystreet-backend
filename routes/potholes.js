const express = require("express");
const multer = require("multer");
const db = require("../models/db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Use /data/uploads if on Render, otherwise ./uploads
const uploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });

/**
 * GET all potholes
 */
router.get("/", (req, res) => {
  try {
    const potholes = db.prepare("SELECT * FROM potholes").all();
    res.json(potholes);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch potholes" });
  }
});

/**
 * POST new pothole
 */
router.post("/", upload.single("photo"), (req, res) => {
  try {
    const { address, description, lat, lng } = req.body;

    // Always store relative path from /uploads (so frontend can fetch easily)
    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${path.basename(req.file.path)}`;
    }

    const stmt = db.prepare(`
      INSERT INTO potholes (address, description, latitude, longitude, photoPath)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(address, description, lat, lng, photoPath);

    res.json({ message: "Pothole reported successfully" });
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ error: "Failed to report pothole" });
  }
});

/**
 * PUT update pothole status
 */
router.put("/:id", (req, res) => {
  try {
    const { status } = req.body;

    const stmt = db.prepare("UPDATE potholes SET status = ? WHERE id = ?");
    const result = stmt.run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Pothole not found" });
    }

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/**
 * DELETE pothole
 */
router.delete("/:id", (req, res) => {
  try {
    const pothole = db.prepare("SELECT * FROM potholes WHERE id = ?").get(req.params.id);

    if (!pothole) {
      return res.status(404).json({ error: "Pothole not found" });
    }

    // Delete photo if it exists
    if (pothole.photoPath) {
      // pothole.photoPath is stored like "/uploads/filename"
      const filePath = path.join(uploadDir, path.basename(pothole.photoPath));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑 Deleted file:", filePath);
      }
    }

    db.prepare("DELETE FROM potholes WHERE id = ?").run(req.params.id);

    res.json({ message: "Pothole deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete pothole" });
  }
});

module.exports = router;

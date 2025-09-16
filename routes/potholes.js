
const express = require("express");
const multer = require("multer");
const dbPromise = require("../models/db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// GET all potholes
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const potholes = await db.all("SELECT * FROM potholes");
    res.json(potholes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch potholes" });
  }
});

// POST new pothole
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const db = await dbPromise;
    const { address, description, lat, lng } = req.body;
    const photoPath = req.file ? `uploads/${req.file.filename}` : null;

    await db.run(
      "INSERT INTO potholes (address, description, latitude, longitude, photoPath) VALUES (?, ?, ?, ?, ?)",
      [address, description, lat, lng, photoPath]
    );

    res.json({ message: "Pothole reported successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to report pothole" });
  }
});

// PUT update pothole status
router.put("/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const { status } = req.body;
    await db.run("UPDATE potholes SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});
// DELETE pothole

router.delete("/:id", async (req, res) => {
  try {
    const db = await dbPromise;

    const pothole = await db.get("SELECT * FROM potholes WHERE id = ?", [
      req.params.id,
    ]);

    if (!pothole) {
      return res.status(404).json({ error: "Pothole not found" });
    }

    // Try deleting the photo file if it exists
    if (pothole.photoPath) {
      const filePath = path.join(process.cwd(), pothole.photoPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑 Deleted file:", filePath);
      } else {
        console.log("⚠️ File not found:", filePath);
      }
    }

    await db.run("DELETE FROM potholes WHERE id = ?", [req.params.id]);

    res.json({ message: "Pothole deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete pothole" });
  }
});

module.exports = router;

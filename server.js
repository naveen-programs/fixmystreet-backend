const express = require("express");
const cors = require("cors");
const path = require("path");
const potholeRoutes = require("./routes/potholes");
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/potholes", potholeRoutes);

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));

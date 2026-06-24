require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const generateRoutes = require("./routes/generateRoutes");
const resistantRoutes = require("./routes/resistantRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
const path = require("path");
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/resistant", resistantRoutes);
app.use("/api/pdf", require("./routes/pdfRoutes"));

app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome user " + req.user.id });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
});
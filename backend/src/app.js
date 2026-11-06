const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { redis } = require("./config/redis");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

app.use("/api", apiLimiter);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to TaskFlow API");
});

app.get("/api/redis-test", async (req, res) => {
  try {
    await redis.set("taskflow:test", "Redis is working!", "EX", 60);

    const value = await redis.get("taskflow:test");

    res.status(200).json({
      success: true,
      message: value,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = app;

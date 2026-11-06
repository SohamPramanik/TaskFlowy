require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { redis, connectRedis } = require("./config/redis");
const { taskQueue } = require("./queues/taskQueue");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");

      server.close(async () => {
        try {
          await taskQueue.close();
          await redis.quit();
          
          const mongoose = require("mongoose");
          await mongoose.disconnect();

          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

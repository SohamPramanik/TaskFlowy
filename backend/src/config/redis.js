const Redis = require("ioredis");

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,

    maxRetriesPerRequest: null,

    retryStrategy(times) {
        return Math.min(times * 500, 5000);
    }
});

redis.on("connect", () => {
    console.log("Redis connected!");
});

redis.on("error", (error) => {
    console.error("Redis error:", error.message);
});

// Wait for Redis to become ready.
// Do not call redis.connect() again.
const connectRedis = async () => {
    await redis.ping();
    console.log("Redis ping successful!");
};

module.exports = {
    redis,
    connectRedis
};

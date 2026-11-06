const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redis } = require("../config/redis");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  //   limit: 100, // Maximum 100 requests
  limit: 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "ratelimit:api:",
  }),

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  passOnStoreError: true,
});

module.exports = { apiLimiter };

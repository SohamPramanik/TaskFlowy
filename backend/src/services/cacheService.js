const { redis } = require("../config/redis");

// GET cached data
const getCache = async (key) => {
  try {
    const data = await redis.get(key);

    if (!data) {
      console.log(`CACHE MISS: ${key}`);
      return null;
    }

    console.log(`CACHE HIT: ${key}`);
    return JSON.parse(data);
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

// SET cached data with TTL
const setCache = async (key, data, ttl = 60) => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (error) {
    console.error("Redis SET error:", error.message);
  }
};

// DELETE cached data
const deleteCache = async (...keys) => {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
};

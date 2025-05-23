import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:5000'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
await redisClient.connect();

// Cache for 1 hour (3600 seconds) by default
export const cache = {
  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  },
  set: async (key, value, ttl = 3600) => {
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    } catch (err) {
      console.error('Cache set error:', err);
    }
  }
};
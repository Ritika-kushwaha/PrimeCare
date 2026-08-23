import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // Retry connection after 2, 4, 8... max 10 seconds
    const delay = Math.min(times * 2000, 10000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully.');
});

redis.on('error', (err) => {
  console.warn('Redis connection error (Ensure Redis is running):', err.message);
});

export default redis;
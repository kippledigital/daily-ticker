import { createClient } from 'redis';

// Create Redis client instance
const getRedisClient = () => {
  const client = createClient({
    url: process.env.KV_URL || process.env.REDIS_URL || process.env.KV_REDIS_URL,
  });

  client.on('error', (err) => console.error('Redis Client Error:', err));

  return client;
};

// Singleton pattern to reuse connection
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!redisClient) {
    redisClient = getRedisClient();
    await redisClient.connect();
  }
  return redisClient;
}

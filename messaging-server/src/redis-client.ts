import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: 'redis://redis:6379'
});

await redisClient.connect();
redisClient.on('error', error => console.error('[Redis client]', error))

export const publisher = redisClient.duplicate();
await publisher.connect();

export const subscriber = redisClient.duplicate();
await subscriber.connect(); 
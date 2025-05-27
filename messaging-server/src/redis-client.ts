import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://redis:6379'
});

redisClient.connect().catch(console.error);

export const publisher = redisClient.duplicate();
await publisher.connect();

export const subscriber = redisClient.duplicate();
await subscriber.connect(); 
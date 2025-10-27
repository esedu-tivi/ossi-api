import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://redis:6379'
});

await redisClient.connect().catch(console.error);

export const publisher = redisClient.duplicate();
export const subscriber = redisClient.duplicate();

export const connectToRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
}

await connectToRedis()

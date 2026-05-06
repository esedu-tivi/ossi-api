import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://redis:6379'
});

export const publisher = redisClient.duplicate();
export const subscriber = redisClient.duplicate();

export const connectToRedis = async () => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  await redisClient.connect();
  await publisher.connect();
  await subscriber.connect();
}

await connectToRedis().catch(console.error);

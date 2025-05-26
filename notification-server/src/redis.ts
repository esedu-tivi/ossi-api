import * as redis from 'redis';

const redisClient = redis.createClient({ url: "redis://redis:6379" });

export { redisClient }

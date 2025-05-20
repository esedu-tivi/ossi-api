import * as redis from 'redis';

const redisPublisher = redis.createClient({ url: "redis://redis:6379" });

export { redisPublisher };

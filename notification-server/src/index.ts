import 'dotenv/config'
import mongoose from "mongoose";
import { notificationSubscriberHandler } from './handlers/notification-redis-subscriber.js';
import { redisClient } from './redis.js';
import { createApp } from "./app.js";

mongoose.connect("mongodb://mongo:27017/");

const app = createApp({
    readinessCheck: async () => mongoose.connection.readyState === 1 && redisClient.isOpen
});

(async () => {
    app.listen(3000);

    await redisClient.connect();
    await redisClient.subscribe("notification", notificationSubscriberHandler);
})();

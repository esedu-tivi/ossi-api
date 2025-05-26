import 'dotenv/config'
import express, { json } from 'express';
import mongoose from "mongoose";
import { NotificationRouter } from './handlers/notification-router.js';
import { notificationSubscriberHandler } from './handlers/notification-redis-subscriber.js';
import { redisClient } from './redis.js';

mongoose.connect("mongodb://mongo:27017/");

const app = express();

app.use("/notifications", NotificationRouter);

(async () => {
    app.listen(3000);

    await redisClient.connect();
    await redisClient.subscribe("notification", notificationSubscriberHandler);
})();

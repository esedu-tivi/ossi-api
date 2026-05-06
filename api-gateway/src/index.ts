import { createApp } from "./app.js";
import { publisher, redisClient, subscriber } from "./redis-client.js";

const app = createApp({
    readinessCheck: async () => redisClient.isOpen && publisher.isOpen && subscriber.isOpen
});

app.listen(3000);

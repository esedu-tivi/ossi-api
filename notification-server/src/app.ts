import express from "express";
import { NotificationRouter } from "./handlers/notification-router.js";

interface AppOptions {
    readinessCheck?: () => Promise<boolean>;
}

export const createApp = (options: AppOptions = {}) => {
    const app = express();

    app.get("/health", (_req, res) => {
        res.json({ ok: true, service: "notification-server" });
    });

    app.get("/ready", async (_req, res) => {
        try {
            const isReady = options.readinessCheck ? await options.readinessCheck() : true;
            if (!isReady) {
                return res.status(503).json({ ok: false, service: "notification-server" });
            }

            return res.json({ ok: true, service: "notification-server" });
        } catch (_error) {
            return res.status(503).json({ ok: false, service: "notification-server" });
        }
    });

    app.use("/notifications", NotificationRouter);

    return app;
};

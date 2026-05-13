import express from "express";
import { AuthRouter } from "./routes/auth-router.js";
import { MagicLinkRouter } from "./routes/magicLink-router.js";

interface AppOptions {
    readinessCheck?: () => Promise<boolean>;
}

export const createApp = (options: AppOptions = {}) => {
    const app = express();
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.json({ ok: true, service: "auth-api" });
    });

    app.get("/ready", async (_req, res) => {
        try {
            const isReady = options.readinessCheck ? await options.readinessCheck() : true;
            if (!isReady) {
                return res.status(503).json({ ok: false, service: "auth-api" });
            }

            return res.json({ ok: true, service: "auth-api" });
        } catch (_error) {
            return res.status(503).json({ ok: false, service: "auth-api" });
        }
    });

    app.use("/login", AuthRouter);
    app.use("/auth/magic-link", MagicLinkRouter);

    return app;
};

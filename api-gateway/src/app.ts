import express from "express";
import graphqlRouter from "./controllers/graphql.js";

interface AppOptions {
    readinessCheck?: () => Promise<boolean>;
}

export const createApp = (options: AppOptions = {}) => {
    const app = express();

    app.get("/health", (_req, res) => {
        res.json({ ok: true, service: "api-gateway" });
    });

    app.get("/ready", async (_req, res) => {
        try {
            const isReady = options.readinessCheck ? await options.readinessCheck() : true;
            if (!isReady) {
                return res.status(503).json({ ok: false, service: "api-gateway" });
            }

            return res.json({ ok: true, service: "api-gateway" });
        } catch (_error) {
            return res.status(503).json({ ok: false, service: "api-gateway" });
        }
    });

    app.use("/graphql", graphqlRouter);

    return app;
};

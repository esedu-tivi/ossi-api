import crypto from "crypto";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import prisma, { enumUsersScope } from "prisma-orm";
import { generateMagicLinkToken } from "../utils/magicLink.js";
import { sendMagicLink } from "../utils/sendEmail.js";

const router = express.Router();

router.post("/request", async (req: Request, res: Response) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    // Magic links are only for existing job supervisors. Respond the same way either way
    // so the endpoint cannot be used to probe which emails exist.
    const jobSupervisor = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" }, scope: enumUsersScope.JOB_SUPERVISOR }
    });
    if (!jobSupervisor || jobSupervisor.archived) {
        return res.json({ ok: true });
    }

    const { token, tokenHash, expiresAt } = generateMagicLinkToken();

    const record = await prisma.magicLinkToken.upsert({
        where: { email },
        update: { tokenHash, expiresAt, createdAt: new Date(Date.now()) },
        create: {
            email,
            tokenHash,
            expiresAt,
        }
    });

    const loginUrl = `${process.env.APP_URL}/auth/magic-link/verify?id=${record.id}&token=${token}`;

    await sendMagicLink(email, loginUrl);

    return res.json({ ok: true });
})

router.post("/verify", async (req: Request, res: Response) => {
    const { id, token } = req.body
    if (!id || !token) {
        return res.status(400).json({ error: "Invalid link" });
    }

    const tokenRecord = await prisma.magicLinkToken.findUnique({ where: { id } });

    if (!tokenRecord) return res.status(404).json({ error: "Invalid or expired link" });
    if (tokenRecord.used) return res.status(400).json({ error: "Link already used" });
    if (new Date(tokenRecord.expiresAt) < new Date()) return res.status(400).json({ error: "Link expired" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== tokenRecord.tokenHash) {
        return res.status(400).json({ error: "Invalid token" });
    }

    await prisma.magicLinkToken.update({
        where: { id },
        data: { used: true },
    });

    const user = await prisma.user.findFirst({
        where: { email: { equals: tokenRecord.email, mode: "insensitive" }, scope: enumUsersScope.JOB_SUPERVISOR }
    });
    if (!user || user.archived) {
        return res.status(400).json({ error: "Invalid or expired link" });
    }

    const jwtToken = jwt.sign({
        id: user.id,
        email: user.email,
        isSetUp: user.isSetUp,
        type: "JOB_SUPERVISOR",
        scope: user.scope,
    }, process.env.JWT_SECRET_KEY ?? "", {
        expiresIn: "1d"
    })

    if (!process.env.APP_URL) {
        return res.status(500).json({ error: "APP_URL not configured" });
    }
    if (!jwtToken) {
        return res.status(400).json({ error: "JWT token missing" });
    }

    return res.json({ ok: true, jwt: jwtToken });
})

export const MagicLinkRouter = router;

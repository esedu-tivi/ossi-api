import crypto from "crypto";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "prisma-orm";
import { HttpError } from "../classes/HttpError.js";
import { generateMagicLinkToken } from "../utils/magicLink.js";
import { sendMagicLink } from "../utils/sendEmail.js";

const router = express.Router();

router.post("/request", async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new HttpError(400, "Email required")
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

    // hash and compare
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== tokenRecord.tokenHash) {
        return res.status(400).json({ error: "Invalid token" });
    }

    // Mark as used
    await prisma.magicLinkToken.update({
        where: { id },
        data: { used: true },
    });

    // create session
    const jwtToken = jwt.sign({}, process.env.JWT_SECRET_KEY ?? "", {
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

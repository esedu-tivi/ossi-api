import crypto from "crypto";

export function generateMagicLinkToken() {
    const token = crypto.randomBytes(32).toString("base64url"); // user-facing token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex"); // stored in DB
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    return { token, tokenHash, expiresAt };
}

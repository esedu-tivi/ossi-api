import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { enumUsersScope } from "prisma-orm";
import { getIdTokenEmail, resolveUserScope, verifyIdToken } from "../src/utils/idToken.js";

const CLIENT_ID = "11111111-1111-1111-1111-111111111111";
const TENANT_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_TENANT_ID = "33333333-3333-3333-3333-333333333333";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const resolveKey = async () => publicKey;
const options = { clientId: CLIENT_ID, tenantId: TENANT_ID };

const signIdToken = (claims: Record<string, unknown>) => jwt.sign({
    oid: "44444444-4444-4444-4444-444444444444",
    tid: TENANT_ID,
    upn: "teacher@esedu.fi",
    aud: CLIENT_ID,
    iss: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
    ...claims,
}, privateKey, { algorithm: "RS256", keyid: "test-key", expiresIn: "1h" });

test("accepts a token issued for our app in our tenant", async () => {
    const payload = await verifyIdToken(signIdToken({}), options, resolveKey);

    assert.equal(payload.upn, "teacher@esedu.fi");
});

test("accepts a v1 token issuer for our tenant", async () => {
    const token = signIdToken({ iss: `https://sts.windows.net/${TENANT_ID}/` });

    await verifyIdToken(token, options, resolveKey);
});

test("rejects a token issued for another application", async () => {
    const token = signIdToken({ aud: "some-other-app" });

    await assert.rejects(verifyIdToken(token, options, resolveKey), /audience/);
});

test("rejects a token issued by another tenant", async () => {
    const token = signIdToken({
        tid: OTHER_TENANT_ID,
        iss: `https://login.microsoftonline.com/${OTHER_TENANT_ID}/v2.0`,
    });

    await assert.rejects(verifyIdToken(token, options, resolveKey), /issuer/);
});

test("rejects a token whose tid claim does not match the tenant", async () => {
    const token = signIdToken({ tid: OTHER_TENANT_ID });

    await assert.rejects(verifyIdToken(token, options, resolveKey), /tenant mismatch/);
});

test("rejects a token signed with another key", async () => {
    const { privateKey: otherKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
    const token = jwt.sign({ tid: TENANT_ID, aud: CLIENT_ID, iss: `https://login.microsoftonline.com/${TENANT_ID}/v2.0` }, otherKey, { algorithm: "RS256" });

    await assert.rejects(verifyIdToken(token, options, resolveKey), /signature/);
});

test("rejects a malformed token", async () => {
    await assert.rejects(verifyIdToken("not-a-jwt", options, resolveKey), /Malformed/);
});

test("resolves roles only for ESEDU domains", () => {
    assert.equal(resolveUserScope("student@esedulainen.fi"), enumUsersScope.STUDENT);
    assert.equal(resolveUserScope("teacher@esedu.fi"), enumUsersScope.TEACHER);
    assert.equal(resolveUserScope("someone@gmail.com"), null);
    assert.equal(resolveUserScope("someone@outlook.com"), null);
    assert.equal(resolveUserScope("attacker@notesedu.fi"), null);
});

test("reads email from upn or preferred_username in lowercase", () => {
    assert.equal(getIdTokenEmail({ upn: "Teacher@Esedu.fi" } as never), "teacher@esedu.fi");
    assert.equal(getIdTokenEmail({ preferred_username: "student@esedulainen.fi" } as never), "student@esedulainen.fi");
    assert.equal(getIdTokenEmail({} as never), null);
});

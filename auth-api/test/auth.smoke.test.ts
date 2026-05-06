import test from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { createApp } from "../src/app.js";

const api = supertest(createApp());

test("auth health endpoint responds with service metadata", async () => {
    const response = await api.get("/health").expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "auth-api");
});

test("auth readiness endpoint responds", async () => {
    const response = await api.get("/ready").expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "auth-api");
});

test("magic-link verify validation rejects empty payload", async () => {
    const response = await api.post("/auth/magic-link/verify").send({}).expect(400);

    assert.equal(response.body.error, "Invalid link");
});

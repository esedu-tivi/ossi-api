import test from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";

test("gateway health endpoint responds", async () => {
    process.env.NODE_ENV = "test";
    const { createApp } = await import("../src/app.js");
    const api = supertest(createApp());
    const response = await api.get("/health").expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "api-gateway");
});

test("gateway readiness endpoint responds", async () => {
    process.env.NODE_ENV = "test";
    const { createApp } = await import("../src/app.js");
    const api = supertest(createApp());
    const response = await api.get("/ready").expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "api-gateway");
});

test("graphql endpoint is mounted for POST requests", async () => {
    process.env.NODE_ENV = "test";
    const { createApp } = await import("../src/app.js");
    const api = supertest(createApp());
    let response = await api.post("/graphql").send({ query: "{ __typename }" });
    for (let i = 0; i < 5 && response.status === 404; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        response = await api.post("/graphql").send({ query: "{ __typename }" });
    }

    assert.notEqual(response.status, 404);
});

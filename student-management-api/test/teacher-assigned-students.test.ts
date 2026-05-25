import { after, test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import app from "../src/app.js";
import prisma from "prisma-orm";

const api = supertest(app);

test("assignedStudents returns not found for unknown teacher", async () => {
    const response = await api
        .get("/teachers/999999999/assignedStudents")
        .expect(200);

    assert.equal(response.body.status, 404);
    assert.equal(response.body.success, false);
});

test("assignedStudents accepts sortBy query", async () => {
    const teacher = await prisma.teacher.findFirst();

    if (!teacher) {
        return;
    }

    await api
        .get(`/teachers/${teacher.userId}/assignedStudents`)
        .query({ sortBy: "name" })
        .expect(200)
        .expect("Content-Type", /application\/json/);
});

after(async () => {
    await prisma.$disconnect();
});

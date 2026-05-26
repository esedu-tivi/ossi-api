import { after, test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import app from "../src/app.js";
import prisma from "prisma-orm";
import { HttpError } from "../src/classes/HttpError.js";
import {
    parseAssignedStudentsSort,
    sortAssignedStudentRows,
    type AssignedStudentRow
} from "../src/services/teacher-assigned-students.js";

const api = supertest(app);

const row = (
    id: number,
    overrides: Partial<AssignedStudentRow> = {}
): AssignedStudentRow => ({
    id,
    firstName: "A",
    lastName: "Student",
    email: `${id}@esedulainen.fi`,
    groupId: "G1",
    xp: 0,
    lastLoginAt: null,
    loginLogs: [],
    totalWorktimeMinutes: 0,
    worktimeLogs: [],
    ...overrides
});

test("parseAssignedStudentsSort defaults when sortBy is omitted", () => {
    assert.equal(parseAssignedStudentsSort(undefined), "lastLogin");
    assert.equal(parseAssignedStudentsSort(""), "lastLogin");
});

test("parseAssignedStudentsSort throws on invalid sortBy", () => {
    assert.throws(
        () => parseAssignedStudentsSort("invalid"),
        (error: HttpError) => error.statusCode === 400
    );
});

test("sortAssignedStudentRows sorts by xp descending", () => {
    const sorted = sortAssignedStudentRows(
        [
            row(1, { xp: 10 }),
            row(2, { xp: 50 }),
            row(3, { xp: 30 })
        ],
        "xp"
    );

    assert.deepEqual(sorted.map((student) => student.id), [2, 3, 1]);
});

test("sortAssignedStudentRows sorts by name", () => {
    const sorted = sortAssignedStudentRows(
        [
            row(1, { lastName: "Zeta", firstName: "Matti" }),
            row(2, { lastName: "Alpha", firstName: "Pekka" }),
            row(3, { lastName: "Alpha", firstName: "Anni" })
        ],
        "name"
    );

    assert.deepEqual(sorted.map((student) => student.id), [3, 2, 1]);
});

test("sortAssignedStudentRows sorts by lastLogin descending", () => {
    const sorted = sortAssignedStudentRows(
        [
            row(1, { lastLoginAt: new Date("2026-01-01T10:00:00Z") }),
            row(2, { lastLoginAt: new Date("2026-05-01T10:00:00Z") }),
            row(3, { lastLoginAt: null })
        ],
        "lastLogin"
    );

    assert.deepEqual(sorted.map((student) => student.id), [2, 1, 3]);
});

test("sortAssignedStudentRows does not mutate input array", () => {
    const input = [
        row(1, { xp: 1 }),
        row(2, { xp: 99 })
    ];
    const inputOrderBefore = input.map((student) => student.id);

    sortAssignedStudentRows(input, "xp");

    assert.deepEqual(input.map((student) => student.id), inputOrderBefore);
});

test("assignedStudents returns not found for unknown teacher", async () => {
    const response = await api
        .get("/teachers/999999999/assignedStudents")
        .expect(200);

    assert.equal(response.body.status, 404);
    assert.equal(response.body.success, false);
});

test("assignedStudents rejects invalid sortBy", async () => {
    const teacher = await prisma.teacher.findFirst();

    if (!teacher) {
        return;
    }

    const response = await api
        .get(`/teachers/${teacher.userId}/assignedStudents`)
        .query({ sortBy: "not-a-sort" })
        .expect(200);

    assert.equal(response.body.status, 400);
    assert.equal(response.body.success, false);
});

after(async () => {
    await prisma.$disconnect();
});

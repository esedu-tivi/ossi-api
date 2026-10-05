import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import {
    authenticatedAsStudentDirectiveTransformer,
    authenticatedAsTeacherDirectiveTransformer,
    authenticatedDirectiveTransformer,
} from "../src/graphql/directive-transformers.js";

const typeDefs = `
    directive @authenticated on FIELD_DEFINITION
    directive @authenticatedAsTeacher on FIELD_DEFINITION
    directive @authenticatedAsStudent on FIELD_DEFINITION

    type Response {
        status: Int
        success: Boolean
        message: String
    }

    type Query {
        anyUser: Response @authenticated
        teacherOnly: Response @authenticatedAsTeacher
        studentOnly: Response @authenticatedAsStudent
    }
`;

const ok = () => ({ status: 200, success: true, message: "ok" });

let schema = makeExecutableSchema({
    typeDefs,
    resolvers: { Query: { anyUser: ok, teacherOnly: ok, studentOnly: ok } },
});
schema = authenticatedDirectiveTransformer(schema);
schema = authenticatedAsTeacherDirectiveTransformer(schema);
schema = authenticatedAsStudentDirectiveTransformer(schema);

const run = async (field: string, user: object | null) => {
    const result = await graphql({
        schema,
        source: `{ ${field} { status } }`,
        contextValue: { user },
    });
    return (result.data as Record<string, { status: number }>)[field].status;
};

const originalEnv = { ...process.env };
afterEach(() => {
    process.env = { ...originalEnv };
});

const setEnv = (disable: string | undefined, nodeEnv: string | undefined) => {
    if (disable === undefined) delete process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL;
    else process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL = disable;
    if (nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = nodeEnv;
};

test("access control is enforced when the variable is missing", async () => {
    setEnv(undefined, "production");

    assert.equal(await run("anyUser", null), 401);
    assert.equal(await run("teacherOnly", null), 401);
});

test("access control is enforced when the variable has an unexpected value", async () => {
    setEnv("False", "development");

    assert.equal(await run("anyUser", null), 401);
});

test("access control cannot be disabled in production", async () => {
    setEnv("true", "production");

    assert.equal(await run("anyUser", null), 401);
    assert.equal(await run("teacherOnly", { type: "STUDENT" }), 401);
});

test("access control can be disabled outside production", async () => {
    setEnv("true", "development");

    assert.equal(await run("teacherOnly", null), 200);
});

test("@authenticated allows students and teachers", async () => {
    setEnv("false", "production");

    assert.equal(await run("anyUser", { type: "STUDENT" }), 200);
    assert.equal(await run("anyUser", { type: "TEACHER" }), 200);
});

test("@authenticated rejects tokens without a known user type", async () => {
    setEnv("false", "production");

    assert.equal(await run("anyUser", {}), 401);
    assert.equal(await run("anyUser", { type: "JOB_SUPERVISOR" }), 401);
});

test("role directives allow only the matching role", async () => {
    setEnv("false", "production");

    assert.equal(await run("teacherOnly", { type: "TEACHER" }), 200);
    assert.equal(await run("teacherOnly", { type: "STUDENT" }), 401);
    assert.equal(await run("studentOnly", { type: "STUDENT" }), 200);
    assert.equal(await run("studentOnly", { type: "TEACHER" }), 401);
});

import test from "node:test";
import assert from "node:assert/strict";
import prisma from "prisma-orm";
import { getUserFromDatabase, resolvers } from "../src/resolvers.js";

test("getUserFromDatabase maps prisma user to GraphQL user shape", async () => {
    const originalFindFirst = prisma.user.findFirst;

    prisma.user.findFirst = async () =>
        ({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            phoneNumber: "123",
            archived: false,
            scope: "TEACHER",
        } as any);

    try {
        const user = await getUserFromDatabase("test@example.com");
        assert.equal(user?.id, "test@example.com");
        assert.equal(user?.firstName, "Test");
        assert.equal(user?.email, "test@example.com");
    } finally {
        prisma.user.findFirst = originalFindFirst;
    }
});

test("searchUsers returns empty list when unauthenticated", async () => {
    const result = await resolvers.Query.searchUsers(
        null,
        { query: "test" },
        { user: null } as any
    );

    assert.deepEqual(result, []);
});

test("searchUsers maps prisma rows and excludes current user", async () => {
    const originalFindMany = prisma.user.findMany;
    let whereArg: any = null;

    prisma.user.findMany = async (args: any) => {
        whereArg = args.where;
        return [
            {
                email: "other@example.com",
                firstName: "Other",
                lastName: "User",
                phoneNumber: "555",
                archived: false,
            },
        ] as any;
    };

    try {
        const result = await resolvers.Query.searchUsers(
            null,
            { query: "oth" },
            { user: { email: "me@example.com" } } as any
        );

        assert.equal(whereArg.email.not, "me@example.com");
        assert.equal(result.length, 1);
        assert.equal(result[0].id, "other@example.com");
    } finally {
        prisma.user.findMany = originalFindMany;
    }
});

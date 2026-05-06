import test from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { createApp } from "../src/app.js";
import {
    ProjectReturnNotification,
    ProjectStatusChangeNotification,
} from "../src/models/notification.js";
import { notificationSubscriberHandler } from "../src/handlers/notification-redis-subscriber.js";

const api = supertest(createApp());

const restoreSave = (ctor: any, calls: any[]) => {
    const original = ctor.prototype.save;
    ctor.prototype.save = async function saveMock() {
        calls.push(this);
        return this;
    };
    return () => {
        ctor.prototype.save = original;
    };
};

test("notification route creates one notification per recipient", async () => {
    const saved: any[] = [];
    const restore = restoreSave(ProjectReturnNotification, saved);

    try {
        await api
            .post("/notifications/send_notification")
            .send({
                recipients: ["user-1", "user-2"],
                notification: {
                    type: "ProjectReturn",
                    projectId: 42,
                    returnerStudentId: "student-1",
                },
            })
            .expect(200);

        assert.equal(saved.length, 2);
        assert.deepEqual(saved.map((doc) => doc.recipient), ["user-1", "user-2"]);
    } finally {
        restore();
    }
});

test("redis subscriber handler persists project status change notifications", async () => {
    const saved: any[] = [];
    const restore = restoreSave(ProjectStatusChangeNotification, saved);

    try {
        await notificationSubscriberHandler(
            JSON.stringify({
                recipients: ["teacher-1"],
                notification: {
                    type: "ProjectStatusChange",
                    projectId: 101,
                    message: "Status changed",
                    status: "ACCEPTED",
                    teacherComment: "Looks good",
                },
            })
        );

        assert.equal(saved.length, 1);
        assert.equal(saved[0].recipient, "teacher-1");
        assert.equal(saved[0].projectId, 101);
    } finally {
        restore();
    }
});

test("redis subscriber rejects unknown notification types", async () => {
    await assert.rejects(async () => {
        await notificationSubscriberHandler(
            JSON.stringify({
                recipients: ["teacher-1"],
                notification: {
                    type: "Unknown",
                },
            })
        );
    });
});

test("notification health endpoint responds", async () => {
    const response = await api.get("/health").expect(200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "notification-server");
});

test("notification readiness endpoint responds", async () => {
    const response = await api.get("/ready").expect(200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, "notification-server");
});

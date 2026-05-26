import { test } from "node:test";
import assert from "node:assert/strict";
import { HttpError } from "../src/classes/HttpError.js";
import { calculateWorktimeDurationMinutes } from "../src/services/worktime-duration.js";

test("calculateWorktimeDurationMinutes returns rounded minutes", () => {
    const minutes = calculateWorktimeDurationMinutes(
        "2026-05-21T08:00:00.000Z",
        "2026-05-21T10:30:00.000Z"
    );

    assert.equal(minutes, 150);
});

test("calculateWorktimeDurationMinutes rejects end before start", () => {
    assert.throws(
        () => calculateWorktimeDurationMinutes(
            "2026-05-21T10:00:00.000Z",
            "2026-05-21T09:00:00.000Z"
        ),
        (error: HttpError) => error.statusCode === 400
    );
});

test("calculateWorktimeDurationMinutes rejects invalid dates", () => {
    assert.throws(
        () => calculateWorktimeDurationMinutes("invalid", "2026-05-21T10:00:00.000Z"),
        (error: HttpError) => error.statusCode === 400
    );
});

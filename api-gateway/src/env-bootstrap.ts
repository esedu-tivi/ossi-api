import { assertRequiredEnv } from "./startup-env.js";

assertRequiredEnv("api-gateway", [
    "JWT_SECRET_KEY",
    "INTERNAL_AUTH_API_URL",
    "INTERNAL_STUDENT_MANAGEMENT_API_URL",
    "INTERNAL_NOTIFICATION_SERVER_URL",
    "INTERNAL_MESSAGING_SERVER_URL",
]);

if (process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL === "true") {
    console.warn(process.env.NODE_ENV === "production"
        ? "DISABLE_ROLE_BASED_ACCESS_CONTROL=true is ignored in production; access control is enabled."
        : "WARNING: role-based access control is disabled (DISABLE_ROLE_BASED_ACCESS_CONTROL=true).");
}

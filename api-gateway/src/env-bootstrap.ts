import { assertRequiredEnv } from "./startup-env.js";

assertRequiredEnv("api-gateway", [
    "JWT_SECRET_KEY",
    "INTERNAL_AUTH_API_URL",
    "INTERNAL_STUDENT_MANAGEMENT_API_URL",
    "INTERNAL_NOTIFICATION_SERVER_URL",
    "INTERNAL_MESSAGING_SERVER_URL",
]);

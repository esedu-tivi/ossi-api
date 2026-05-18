import { assertRequiredEnv } from "prisma-orm/validate-env";

assertRequiredEnv("auth-api", [
    "JWT_SECRET_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "APP_URL",
]);

import { assertRequiredEnv } from "prisma-orm/validate-env";

assertRequiredEnv("auth-api", [
    "JWT_SECRET_KEY",
    "MS_CLIENT_ID",
    "MS_TENANT_ID",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "APP_URL",
]);

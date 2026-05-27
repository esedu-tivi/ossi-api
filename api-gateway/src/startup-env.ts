import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loadProjectEnv(): void {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        path.join(process.cwd(), ".env"),
        path.join(moduleDir, ".env"),
        path.join(moduleDir, "..", ".env"),
        path.join(moduleDir, "../../.env"),
        path.join(moduleDir, "../../../.env"),
    ];
    for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        }
    }
}

export function getMissingEnvKeys(keys: readonly string[]): string[] {
    return keys.filter((key) => {
        const value = process.env[key];
        return value === undefined || String(value).trim() === "";
    });
}

export function formatMissingEnvMessage(serviceLabel: string, missing: readonly string[]): string {
    const list = missing.map((key) => `  - ${key}`).join("\n");
    return [
        `Error: ${serviceLabel} failed to start.`,
        "Missing required environment variables (unset or empty):",
        list,
        "Set values in .env or the container environment.",
    ].join("\n");
}

export function assertRequiredEnv(serviceLabel: string, keys: readonly string[]): void {
    loadProjectEnv();
    const missing = getMissingEnvKeys(keys);
    if (missing.length === 0) {
        return;
    }
    console.error(formatMissingEnvMessage(serviceLabel, missing));
    process.exit(1);
}

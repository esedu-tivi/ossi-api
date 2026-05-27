import path from "path"
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./validate-env.js";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  }
})

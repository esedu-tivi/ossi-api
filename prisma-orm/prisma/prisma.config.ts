import path from "path"
import { defineConfig } from "prisma/config";
import "dotenv/config"; // add this

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
})
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    seed: `npx tsx --env-file=.env prisma/seed.ts`,
  },
})

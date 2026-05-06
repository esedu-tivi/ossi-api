import "dotenv"
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.NODE_ENV === "test"
  ? process.env.DATABASE_URL_TEST
  : process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString: DATABASE_URL })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from "./generated/prisma/client.js"

export type { PrismaClient } from "./generated/prisma/client.js"
export * from "./generated/prisma/enums.js"

export default prisma

import "dotenv"
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.NODE_ENV === "test"
  ? process.env.DATABASE_URL_TEST
  : process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString: DATABASE_URL })

//Store Prisma client as a global variable to do prevent client reloading by hot reload in non-production environment

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

// Re-export everything from generated client (types + helpers)
export * from "./generated/prisma/client.js"

export type { PrismaClient } from "./generated/prisma/client.js"
export * from "./generated/prisma/enums.js"

//export * from "@prisma/client/runtime/library"

export default prisma

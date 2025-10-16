import { PrismaClient } from "prisma-orm"
import { PrismaPg } from "@prisma/adapter-pg"

const DATABASE_URL = process.env.NODE_ENV === "test"
  ? process.env.DATABASE_URL_TEST
  : process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma: PrismaClient = new PrismaClient({ adapter })

export default prisma
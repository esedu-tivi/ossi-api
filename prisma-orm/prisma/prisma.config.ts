import { defineConfig } from 'prisma/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});

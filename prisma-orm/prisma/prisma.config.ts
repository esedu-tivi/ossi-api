import { defineConfig } from 'prisma/config';
import { resolveDatabaseUrl } from '../validate-env.js';

export default defineConfig({
  datasource: {
    url: resolveDatabaseUrl('prisma'),
  },
});

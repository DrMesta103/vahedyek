import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 6 skips default env loading when prisma.config.ts exists.
// Force apps/taav-ai-lab/.env so monorepo/shell DATABASE_URL does not override.
config({ path: path.resolve(__dirname, '.env'), override: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

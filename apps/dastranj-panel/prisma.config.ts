import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * پیکربندی CLI پریزما (نسخهٔ ۶ به‌بعد). مسیرها نسبت به همین فایل (ریشهٔ اپ) هستند.
 * آدرس دیتابیس همچنان در prisma/schema.prisma از env خوانده می‌شود.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

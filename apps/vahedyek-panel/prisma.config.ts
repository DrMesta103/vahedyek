import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// با prisma.config.ts، خودِ پریزما دیگر متغیرهای محیط را از .env بار نمی‌کند؛ با dotenv دوباره مثل قبل آماده می‌شود (از مسیر cwd، یعنی ریشهٔ همین اپ).

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

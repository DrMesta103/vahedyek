ALTER TABLE "AppUser"
ADD COLUMN "mobile" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "AppUser"
SET
  "firstName" = COALESCE(NULLIF(split_part("fullName", ' ', 1), ''), 'کاربر'),
  "lastName" = COALESCE(NULLIF(BTRIM(SUBSTRING("fullName" FROM LENGTH(split_part("fullName", ' ', 1)) + 1)), ''), '-')
WHERE "firstName" IS NULL OR "lastName" IS NULL;

ALTER TABLE "AppUser"
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

CREATE UNIQUE INDEX "AppUser_mobile_key" ON "AppUser"("mobile");

ALTER TABLE "Tenant"
ADD COLUMN "packageKey" TEXT NOT NULL DEFAULT 'starter',
ADD COLUMN "billingCycle" TEXT NOT NULL DEFAULT 'monthly';

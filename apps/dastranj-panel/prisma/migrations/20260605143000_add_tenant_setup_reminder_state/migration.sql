CREATE TABLE "TenantSetupReminderState" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reminderKey" TEXT NOT NULL,
  "dismissedUntil" TIMESTAMP(3),
  "dismissedCount" INTEGER NOT NULL DEFAULT 0,
  "lastShownAt" TIMESTAMP(3),
  "lastActionAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TenantSetupReminderState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantSetupReminderState_tenantId_userId_reminderKey_key"
  ON "TenantSetupReminderState"("tenantId", "userId", "reminderKey");

CREATE INDEX "TenantSetupReminderState_tenantId_userId_idx"
  ON "TenantSetupReminderState"("tenantId", "userId");

CREATE INDEX "TenantSetupReminderState_tenantId_reminderKey_idx"
  ON "TenantSetupReminderState"("tenantId", "reminderKey");

ALTER TABLE "TenantSetupReminderState"
  ADD CONSTRAINT "TenantSetupReminderState_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantSetupReminderState"
  ADD CONSTRAINT "TenantSetupReminderState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

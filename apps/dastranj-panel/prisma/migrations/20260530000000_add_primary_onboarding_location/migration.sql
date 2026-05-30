ALTER TABLE "Location" ADD COLUMN "isPrimaryOnboarding" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Location_tenantId_isPrimaryOnboarding_idx" ON "Location"("tenantId", "isPrimaryOnboarding");

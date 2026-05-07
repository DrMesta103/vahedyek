ALTER TABLE "Tenant"
ADD COLUMN "approvalProcessConfig" JSONB NOT NULL DEFAULT '{}';

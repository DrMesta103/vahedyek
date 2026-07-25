CREATE TABLE "OffboardingApprovalStep" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "offboardingId" TEXT NOT NULL,
  "stepType" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "approverId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "comment" TEXT,
  "rejectReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "OffboardingApprovalStep_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OffboardingApprovalStep_offboardingId_stepType_key" ON "OffboardingApprovalStep"("offboardingId", "stepType");
CREATE INDEX "OffboardingApprovalStep_tenantId_offboardingId_sequence_idx" ON "OffboardingApprovalStep"("tenantId", "offboardingId", "sequence");
CREATE INDEX "OffboardingApprovalStep_tenantId_approverId_status_idx" ON "OffboardingApprovalStep"("tenantId", "approverId", "status");
ALTER TABLE "OffboardingApprovalStep" ADD CONSTRAINT "OffboardingApprovalStep_offboardingId_fkey" FOREIGN KEY ("offboardingId") REFERENCES "EmployeeTerminationIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

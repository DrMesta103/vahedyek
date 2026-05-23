-- AlterTable
ALTER TABLE "WorkGroupMember"
ADD COLUMN "leftAt" TIMESTAMP(3),
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT true;

-- DropIndex
DROP INDEX IF EXISTS "WorkGroupMember_workGroupId_employeeId_key";

-- CreateIndex
CREATE INDEX "WorkGroupMember_workGroupId_isCurrent_idx" ON "WorkGroupMember"("workGroupId", "isCurrent");

-- CreateIndex
CREATE INDEX "WorkGroupMember_employeeId_isCurrent_idx" ON "WorkGroupMember"("employeeId", "isCurrent");

-- CreateIndex
CREATE INDEX "WorkGroupMember_workGroupId_employeeId_idx" ON "WorkGroupMember"("workGroupId", "employeeId");

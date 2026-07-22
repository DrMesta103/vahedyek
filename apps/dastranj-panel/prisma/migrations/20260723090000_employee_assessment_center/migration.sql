CREATE TYPE "EmployeeAssessmentType" AS ENUM ('HUMAN', 'SYSTEM_ANALYSIS', 'PERIODIC', 'EVENT_BASED', 'RECRUITMENT');
CREATE TYPE "EmployeeAssessmentPeriodType" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'EVENT_BASED');
CREATE TYPE "EmployeeAssessmentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'WAITING_APPROVAL', 'FINALIZED', 'ARCHIVED');
CREATE TYPE "EmployeeAssessmentCriterionSource" AS ENUM ('JOB_PROFILE', 'ORGANIZATION', 'MANUAL');
CREATE TYPE "EmployeeAssessmentActionType" AS ENUM ('TRAINING', 'DEVELOPMENT_PLAN', 'IMPROVEMENT_ACTION', 'PROMOTION_PROPOSAL', 'REWARD_PROPOSAL');
CREATE TYPE "EmployeeAssessmentActionStatus" AS ENUM ('OPEN', 'ACCEPTED', 'REJECTED', 'COMPLETED');

CREATE TABLE "EmployeeAssessment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "EmployeeAssessmentType" NOT NULL DEFAULT 'HUMAN',
  "periodType" "EmployeeAssessmentPeriodType" NOT NULL,
  "periodLabel" TEXT,
  "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "EmployeeAssessmentStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewerUserId" TEXT,
  "reviewerRole" TEXT,
  "sourceModule" TEXT NOT NULL DEFAULT 'assessment_center',
  "sourceRecordId" TEXT,
  "sourceLabel" TEXT,
  "jobProfileSnapshot" JSONB NOT NULL DEFAULT '{}',
  "positionSnapshot" JSONB NOT NULL DEFAULT '{}',
  "performanceLevel" TEXT,
  "totalScore" DECIMAL(7,2),
  "managerNotes" TEXT,
  "hrRecommendation" TEXT,
  "nonRenewalRecommendation" TEXT,
  "complaintData" TEXT,
  "finalizedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeAssessment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmployeeAssessmentCriterion" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "source" "EmployeeAssessmentCriterionSource" NOT NULL,
  "sourceRecordId" TEXT,
  "weight" INTEGER NOT NULL DEFAULT 1,
  "maxScore" INTEGER NOT NULL DEFAULT 100,
  "snapshot" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "EmployeeAssessmentCriterion_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmployeeAssessmentScore" (
  "id" TEXT NOT NULL,
  "criterionId" TEXT NOT NULL,
  "score" DECIMAL(7,2) NOT NULL,
  "evidence" TEXT NOT NULL,
  "note" TEXT,
  CONSTRAINT "EmployeeAssessmentScore_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmployeeAssessmentAction" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "type" "EmployeeAssessmentActionType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "EmployeeAssessmentActionStatus" NOT NULL DEFAULT 'OPEN',
  "dueDate" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeAssessmentAction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmployeeAssessmentAuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorRole" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeAssessmentAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmployeeAssessmentScore_criterionId_key" ON "EmployeeAssessmentScore"("criterionId");
CREATE INDEX "EmployeeAssessment_tenantId_employeeId_assessmentDate_idx" ON "EmployeeAssessment"("tenantId", "employeeId", "assessmentDate");
CREATE INDEX "EmployeeAssessment_tenantId_status_idx" ON "EmployeeAssessment"("tenantId", "status");
CREATE INDEX "EmployeeAssessmentCriterion_assessmentId_idx" ON "EmployeeAssessmentCriterion"("assessmentId");
CREATE INDEX "EmployeeAssessmentAction_assessmentId_status_idx" ON "EmployeeAssessmentAction"("assessmentId", "status");
CREATE INDEX "EmployeeAssessmentAuditLog_tenantId_employeeId_createdAt_idx" ON "EmployeeAssessmentAuditLog"("tenantId", "employeeId", "createdAt");
CREATE INDEX "EmployeeAssessmentAuditLog_tenantId_assessmentId_createdAt_idx" ON "EmployeeAssessmentAuditLog"("tenantId", "assessmentId", "createdAt");
ALTER TABLE "EmployeeAssessment" ADD CONSTRAINT "EmployeeAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessment" ADD CONSTRAINT "EmployeeAssessment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessmentCriterion" ADD CONSTRAINT "EmployeeAssessmentCriterion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "EmployeeAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessmentScore" ADD CONSTRAINT "EmployeeAssessmentScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "EmployeeAssessmentCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessmentAction" ADD CONSTRAINT "EmployeeAssessmentAction_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "EmployeeAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessmentAuditLog" ADD CONSTRAINT "EmployeeAssessmentAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeAssessmentAuditLog" ADD CONSTRAINT "EmployeeAssessmentAuditLog_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "EmployeeAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobClassification"
  ADD COLUMN "jobProfileRevision" INTEGER,
  ADD COLUMN "gradeId" TEXT,
  ADD COLUMN "rankId" TEXT;

ALTER TABLE "JobEvaluationCriterion"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "maxScore" INTEGER NOT NULL DEFAULT 100;

ALTER TABLE "JobEvaluation"
  ADD COLUMN "classificationId" TEXT,
  ADD COLUMN "totalScore" DECIMAL(7,2),
  ADD COLUMN "evaluationLevel" TEXT,
  ADD COLUMN "reason" TEXT,
  ADD COLUMN "effectiveAt" TIMESTAMP(3),
  ADD COLUMN "suggestedLevelId" TEXT,
  ADD COLUMN "suggestedGradeId" TEXT,
  ADD COLUMN "suggestedRankId" TEXT,
  ADD COLUMN "approvedBy" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "JobEvaluation" ALTER COLUMN "score" DROP NOT NULL;

CREATE TABLE "JobGrade" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobGrade_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobRank" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "gradeId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobRank_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobEvaluationItem" (
  "id" TEXT NOT NULL,
  "evaluationId" TEXT NOT NULL,
  "criterionId" TEXT NOT NULL,
  "weight" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "score" DECIMAL(7,2) NOT NULL,
  "description" TEXT,
  "evidence" TEXT NOT NULL,
  CONSTRAINT "JobEvaluationItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobCompensationRange" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "classificationId" TEXT NOT NULL,
  "gradeId" TEXT NOT NULL,
  "minimumAmount" DECIMAL(18,2) NOT NULL,
  "maximumAmount" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'IRR',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "reason" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobCompensationRange_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobGrade_tenantId_code_key" ON "JobGrade"("tenantId", "code");
CREATE UNIQUE INDEX "JobGrade_tenantId_sortOrder_key" ON "JobGrade"("tenantId", "sortOrder");
CREATE INDEX "JobGrade_tenantId_status_idx" ON "JobGrade"("tenantId", "status");
CREATE UNIQUE INDEX "JobRank_tenantId_code_key" ON "JobRank"("tenantId", "code");
CREATE UNIQUE INDEX "JobRank_gradeId_sortOrder_key" ON "JobRank"("gradeId", "sortOrder");
CREATE INDEX "JobRank_tenantId_gradeId_status_idx" ON "JobRank"("tenantId", "gradeId", "status");
CREATE UNIQUE INDEX "JobEvaluationItem_evaluationId_criterionId_key" ON "JobEvaluationItem"("evaluationId", "criterionId");
CREATE INDEX "JobEvaluationItem_criterionId_idx" ON "JobEvaluationItem"("criterionId");
CREATE INDEX "JobEvaluation_tenantId_classificationId_createdAt_idx" ON "JobEvaluation"("tenantId", "classificationId", "createdAt");
CREATE INDEX "JobCompensationRange_tenantId_classificationId_status_effectiveFrom_idx" ON "JobCompensationRange"("tenantId", "classificationId", "status", "effectiveFrom");
CREATE INDEX "JobCompensationRange_tenantId_gradeId_status_idx" ON "JobCompensationRange"("tenantId", "gradeId", "status");

ALTER TABLE "JobClassification" ADD CONSTRAINT "JobClassification_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "JobGrade"("id") ON DELETE RESTRICT;
ALTER TABLE "JobClassification" ADD CONSTRAINT "JobClassification_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "JobRank"("id") ON DELETE RESTRICT;
ALTER TABLE "JobGrade" ADD CONSTRAINT "JobGrade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
ALTER TABLE "JobRank" ADD CONSTRAINT "JobRank_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
ALTER TABLE "JobRank" ADD CONSTRAINT "JobRank_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "JobGrade"("id") ON DELETE RESTRICT;
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "JobClassification"("id") ON DELETE RESTRICT;
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_suggestedLevelId_fkey" FOREIGN KEY ("suggestedLevelId") REFERENCES "JobLevel"("id") ON DELETE RESTRICT;
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_suggestedGradeId_fkey" FOREIGN KEY ("suggestedGradeId") REFERENCES "JobGrade"("id") ON DELETE RESTRICT;
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_suggestedRankId_fkey" FOREIGN KEY ("suggestedRankId") REFERENCES "JobRank"("id") ON DELETE RESTRICT;
ALTER TABLE "JobEvaluationItem" ADD CONSTRAINT "JobEvaluationItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "JobEvaluation"("id") ON DELETE CASCADE;
ALTER TABLE "JobEvaluationItem" ADD CONSTRAINT "JobEvaluationItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "JobEvaluationCriterion"("id") ON DELETE RESTRICT;
ALTER TABLE "JobCompensationRange" ADD CONSTRAINT "JobCompensationRange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
ALTER TABLE "JobCompensationRange" ADD CONSTRAINT "JobCompensationRange_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "JobClassification"("id") ON DELETE RESTRICT;
ALTER TABLE "JobCompensationRange" ADD CONSTRAINT "JobCompensationRange_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "JobGrade"("id") ON DELETE RESTRICT;

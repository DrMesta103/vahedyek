CREATE TYPE "JobEvaluationWorkflowState" AS ENUM ('CREATED', 'SCORED', 'APPROVED', 'REJECTED');
ALTER TABLE "JobEvaluation" ADD COLUMN "workflowState" "JobEvaluationWorkflowState";
CREATE INDEX "JobEvaluation_tenantId_workflowState_effectiveAt_idx" ON "JobEvaluation"("tenantId", "workflowState", "effectiveAt");

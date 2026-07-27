-- Persist the initial Knowledge Base build before a Knowledge Base exists.
CREATE TYPE "TaaviaKnowledgeBaseBuildStepKey" AS ENUM ('PREPARATION', 'SOURCE_SNAPSHOT', 'CONTENT_PROCESSING', 'CATEGORY_GENERATION', 'KNOWLEDGE_GENERATION', 'FINALIZATION');
CREATE TYPE "TaaviaKnowledgeBaseBuildStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

ALTER TABLE "TaaviaKnowledgeBaseBuild" ALTER COLUMN "knowledgeBaseId" DROP NOT NULL;
ALTER TABLE "TaaviaKnowledgeBaseBuild" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "TaaviaKnowledgeBaseBuild" ADD COLUMN "overallProgress" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "selectedSourceIds" JSONB,
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "TaaviaKnowledgeSourceSnapshot" ALTER COLUMN "knowledgeBaseId" DROP NOT NULL;
ALTER TABLE "TaaviaKnowledgeCategory" ALTER COLUMN "knowledgeBaseId" DROP NOT NULL;

CREATE TABLE "TaaviaKnowledgeBaseBuildStep" (
  "id" TEXT NOT NULL, "buildId" TEXT NOT NULL, "key" "TaaviaKnowledgeBaseBuildStepKey" NOT NULL,
  "stepOrder" INTEGER NOT NULL, "status" "TaaviaKnowledgeBaseBuildStepStatus" NOT NULL DEFAULT 'PENDING',
  "progress" INTEGER NOT NULL DEFAULT 0, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3), "errorCode" TEXT, "errorMessage" TEXT,
  CONSTRAINT "TaaviaKnowledgeBaseBuildStep_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TaaviaKnowledgeBaseBuildStep_buildId_key_key" ON "TaaviaKnowledgeBaseBuildStep"("buildId", "key");
CREATE UNIQUE INDEX "TaaviaKnowledgeBaseBuildStep_buildId_stepOrder_key" ON "TaaviaKnowledgeBaseBuildStep"("buildId", "stepOrder");
CREATE INDEX "TaaviaKnowledgeBaseBuildStep_buildId_status_idx" ON "TaaviaKnowledgeBaseBuildStep"("buildId", "status");
ALTER TABLE "TaaviaKnowledgeBaseBuildStep" ADD CONSTRAINT "TaaviaKnowledgeBaseBuildStep_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "TaaviaKnowledgeBaseBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostgreSQL partial index protects the invariant even if a request races another request.
CREATE UNIQUE INDEX "TaaviaKnowledgeBaseBuild_one_active_per_brand" ON "TaaviaKnowledgeBaseBuild"("tenantId", "brandId") WHERE "status" IN ('PENDING', 'PROCESSING');

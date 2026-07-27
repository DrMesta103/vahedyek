ALTER TABLE "TaaviaKnowledgeCategory" ADD COLUMN "buildId" TEXT;
CREATE INDEX "TaaviaKnowledgeCategory_tenantId_brandId_buildId_idx" ON "TaaviaKnowledgeCategory"("tenantId", "brandId", "buildId");
ALTER TABLE "TaaviaKnowledgeCategorySourceReference" ADD COLUMN "buildId" TEXT NOT NULL DEFAULT '';

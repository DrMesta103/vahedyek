DROP INDEX IF EXISTS "TaaviaKnowledgeBaseBuild_one_active_per_brand";

CREATE UNIQUE INDEX "TaaviaKnowledgeBaseBuild_one_active_per_brand"
  ON "TaaviaKnowledgeBaseBuild"("tenantId", "brandId")
  WHERE "status" IN ('PENDING', 'PROCESSING', 'RUNNING');

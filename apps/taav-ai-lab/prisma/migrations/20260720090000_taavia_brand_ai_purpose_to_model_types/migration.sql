-- Align TaaviaBrandAiModelPurpose with admin AiProviderModelTypeV2 slots.

CREATE TYPE "TaaviaBrandAiModelPurpose_new" AS ENUM (
  'NONE',
  'TEXT_GENERATION',
  'EMBEDDING',
  'RERANKING',
  'SPEECH_TO_TEXT',
  'TEXT_TO_SPEECH',
  'IMAGE_GENERATION',
  'DOCUMENT_EXTRACTION',
  'MODERATION'
);

DROP INDEX IF EXISTS "TaaviaBrandAiModelAssignment_open_key";

ALTER TABLE "TaaviaBrandAiModelAssignment"
  ALTER COLUMN "purpose" TYPE "TaaviaBrandAiModelPurpose_new"
  USING (
    CASE "purpose"::text
      WHEN 'ADMIN_AGENT_CHAT' THEN 'TEXT_GENERATION'
      WHEN 'CUSTOMER_CHAT' THEN 'TEXT_GENERATION'
      WHEN 'KNOWLEDGE_BASE_CONTENT_GENERATION' THEN 'TEXT_GENERATION'
      WHEN 'VISION_ANALYSIS' THEN 'TEXT_GENERATION'
      WHEN 'OCR' THEN 'DOCUMENT_EXTRACTION'
      WHEN 'EMBEDDING' THEN 'EMBEDDING'
      WHEN 'RERANKING' THEN 'RERANKING'
      WHEN 'SPEECH_TO_TEXT' THEN 'SPEECH_TO_TEXT'
      WHEN 'TEXT_TO_SPEECH' THEN 'TEXT_TO_SPEECH'
      WHEN 'NONE' THEN 'NONE'
      ELSE 'NONE'
    END
  )::"TaaviaBrandAiModelPurpose_new";

ALTER TABLE "TaaviaBrandAiModelUsage"
  ALTER COLUMN "purpose" TYPE "TaaviaBrandAiModelPurpose_new"
  USING (
    CASE "purpose"::text
      WHEN 'ADMIN_AGENT_CHAT' THEN 'TEXT_GENERATION'
      WHEN 'CUSTOMER_CHAT' THEN 'TEXT_GENERATION'
      WHEN 'KNOWLEDGE_BASE_CONTENT_GENERATION' THEN 'TEXT_GENERATION'
      WHEN 'VISION_ANALYSIS' THEN 'TEXT_GENERATION'
      WHEN 'OCR' THEN 'DOCUMENT_EXTRACTION'
      WHEN 'EMBEDDING' THEN 'EMBEDDING'
      WHEN 'RERANKING' THEN 'RERANKING'
      WHEN 'SPEECH_TO_TEXT' THEN 'SPEECH_TO_TEXT'
      WHEN 'TEXT_TO_SPEECH' THEN 'TEXT_TO_SPEECH'
      WHEN 'NONE' THEN 'NONE'
      ELSE 'NONE'
    END
  )::"TaaviaBrandAiModelPurpose_new";

UPDATE "AiProviderModelAssignment"
SET "purposeCode" = CASE "purposeCode"
  WHEN 'ADMIN_AGENT_CHAT' THEN 'TEXT_GENERATION'
  WHEN 'CUSTOMER_CHAT' THEN 'TEXT_GENERATION'
  WHEN 'KNOWLEDGE_BASE_CONTENT_GENERATION' THEN 'TEXT_GENERATION'
  WHEN 'VISION_ANALYSIS' THEN 'TEXT_GENERATION'
  WHEN 'OCR' THEN 'DOCUMENT_EXTRACTION'
  ELSE "purposeCode"
END
WHERE "purposeCode" IN (
  'ADMIN_AGENT_CHAT',
  'CUSTOMER_CHAT',
  'KNOWLEDGE_BASE_CONTENT_GENERATION',
  'VISION_ANALYSIS',
  'OCR'
);

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "tenantId", "brandId", "purpose"
      ORDER BY "effectiveFrom" DESC, "createdAt" DESC, id DESC
    ) AS rn
  FROM "TaaviaBrandAiModelAssignment"
  WHERE "effectiveTo" IS NULL
),
closed AS (
  UPDATE "TaaviaBrandAiModelAssignment" AS assignment
  SET
    "effectiveTo" = NOW(),
    "endedBy" = 'system-migration'
  FROM ranked
  WHERE assignment.id = ranked.id
    AND ranked.rn > 1
  RETURNING assignment.id
)
UPDATE "AiProviderModelAssignment" AS registry
SET
  "effectiveTo" = NOW(),
  "endedBy" = 'system-migration'
FROM closed
WHERE registry."externalAssignmentId" = closed.id
  AND registry."effectiveTo" IS NULL;

DROP TYPE "TaaviaBrandAiModelPurpose";
ALTER TYPE "TaaviaBrandAiModelPurpose_new" RENAME TO "TaaviaBrandAiModelPurpose";

CREATE UNIQUE INDEX "TaaviaBrandAiModelAssignment_open_key"
  ON "TaaviaBrandAiModelAssignment" ("tenantId", "brandId", "purpose")
  WHERE "effectiveTo" IS NULL;

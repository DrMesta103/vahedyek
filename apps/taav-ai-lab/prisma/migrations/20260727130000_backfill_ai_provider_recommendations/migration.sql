-- Set safe initial recommendations for existing installations. This migration is
-- intentionally idempotent and only adds recommendations; admin selections made
-- after deployment remain untouched because Prisma runs each migration once.

-- ChatGPT / OpenAI is the initial recommended provider account when it is active.
UPDATE "AiProviderAccountV2"
SET "isRecommended" = true
WHERE "providerType" = 'OpenAi'
  AND "isActive" = true;

-- Recommend each compatible active OpenAI model for the two configurable Taavia
-- purposes. Existing recommendations are preserved and duplicates are removed.
UPDATE "AiProviderModelV2" AS model
SET "recommendedForPurposes" = ARRAY(
  SELECT DISTINCT purpose
  FROM unnest(model."recommendedForPurposes" || CASE model."modelType"
    WHEN 'TextGeneration' THEN ARRAY['TEXT_GENERATION'::"TaaviaBrandAiModelPurpose"]
    WHEN 'DocumentExtraction' THEN ARRAY['DOCUMENT_EXTRACTION'::"TaaviaBrandAiModelPurpose"]
    ELSE ARRAY[]::"TaaviaBrandAiModelPurpose"[]
  END) AS purpose
  ORDER BY purpose
)
FROM "AiProviderAccountV2" AS account
WHERE account.id = model."aiProviderAccountId"
  AND account."providerType" = 'OpenAi'
  AND account."isActive" = true
  AND model."isActive" = true
  AND model."modelType" IN ('TextGeneration', 'DocumentExtraction');

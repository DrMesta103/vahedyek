ALTER TABLE "AiProviderAccountV2"
ADD COLUMN "isRecommended" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "AiProviderModelV2"
ADD COLUMN "recommendedForPurposes" "TaaviaBrandAiModelPurpose"[] NOT NULL DEFAULT ARRAY[]::"TaaviaBrandAiModelPurpose"[];

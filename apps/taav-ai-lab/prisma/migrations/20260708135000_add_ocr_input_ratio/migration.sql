-- Add ocrInputRatio to AiProviderModel for OCR token split.
ALTER TABLE "AiProviderModel"
ADD COLUMN "ocrInputRatio" DECIMAL(5, 4) NOT NULL DEFAULT 0.6;

-- Backfill known OCR ratios (kept in sync with app/lib/ocr-models.ts).
UPDATE "AiProviderModel"
SET "ocrInputRatio" = 0.58
WHERE "modelType" = 'OCR' AND "providerModelName" = 'gpt-4o-ocr';

UPDATE "AiProviderModel"
SET "ocrInputRatio" = 0.64
WHERE "modelType" = 'OCR' AND "providerModelName" = 'deepseek-ocr';

UPDATE "AiProviderModel"
SET "ocrInputRatio" = 0.60
WHERE "modelType" = 'OCR' AND "providerModelName" = 'gemini-2-flash';

UPDATE "AiProviderModel"
SET "ocrInputRatio" = 0.62
WHERE "modelType" = 'OCR' AND "providerModelName" = 'grok-2';


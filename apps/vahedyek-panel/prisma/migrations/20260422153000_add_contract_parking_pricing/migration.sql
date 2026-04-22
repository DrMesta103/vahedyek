ALTER TABLE "ContractFinancial"
ADD COLUMN IF NOT EXISTS "unitArea" DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS "parkingArea" DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS "parkingPricePerMeter" DECIMAL(18,2);

UPDATE "ContractFinancial"
SET
  "unitArea" = COALESCE("unitArea", "totalArea"),
  "parkingArea" = COALESCE("parkingArea", 0)
WHERE "pricingType" = 'metered';

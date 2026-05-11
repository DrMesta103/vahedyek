ALTER TABLE "ContractFinancial"
ADD COLUMN "areaPricingMode" TEXT NOT NULL DEFAULT 'unit-only',
ADD COLUMN "storageArea" DECIMAL(18,2),
ADD COLUMN "storagePricePerMeter" DECIMAL(18,2);

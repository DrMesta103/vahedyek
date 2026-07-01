-- AlterTable
ALTER TABLE "AiPricingModel" ADD COLUMN     "relatedModelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

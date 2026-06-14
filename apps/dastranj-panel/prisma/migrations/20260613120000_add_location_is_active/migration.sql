-- Add active flag to locations so used locations can be disabled instead of deleted.
ALTER TABLE "Location"
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

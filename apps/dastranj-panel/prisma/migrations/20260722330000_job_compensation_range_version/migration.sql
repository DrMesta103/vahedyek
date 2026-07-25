ALTER TABLE "JobCompensationRange" ADD COLUMN "version" INTEGER;
CREATE UNIQUE INDEX "JobCompensationRange_classificationId_version_key" ON "JobCompensationRange"("classificationId", "version");

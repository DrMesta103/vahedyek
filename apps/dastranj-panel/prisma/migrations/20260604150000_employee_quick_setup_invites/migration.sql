-- AlterTable
ALTER TABLE "Employee"
ADD COLUMN "quickSetupStatus" TEXT,
ADD COLUMN "quickSetupAddMethod" TEXT,
ADD COLUMN "quickSetupInvitationStatus" TEXT,
ADD COLUMN "quickSetupLastActionAt" TIMESTAMP(3);

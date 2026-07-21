-- CreateEnum
CREATE TYPE "FirstPartyRelatedParticipantRole" AS ENUM ('representative', 'board_member', 'natural_shareholder', 'legal_shareholder');

-- CreateTable
CREATE TABLE "ContractFirstPartyRelatedParticipant" (
    "id" TEXT NOT NULL,
    "partiesId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceDirectoryId" TEXT,
    "personType" "PersonType" NOT NULL,
    "role" "FirstPartyRelatedParticipantRole" NOT NULL,
    "name" TEXT NOT NULL,
    "parentParticipantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractFirstPartyRelatedParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractFirstPartyRelatedParticipant_source_role_key" ON "ContractFirstPartyRelatedParticipant"("partiesId", "role", "sourceId");

-- CreateIndex
CREATE INDEX "ContractFirstPartyRelatedParticipant_parties_role_idx" ON "ContractFirstPartyRelatedParticipant"("partiesId", "role");

-- CreateIndex
CREATE INDEX "ContractFirstPartyRelatedParticipant_parent_idx" ON "ContractFirstPartyRelatedParticipant"("parentParticipantId");

-- AddForeignKey
ALTER TABLE "ContractFirstPartyRelatedParticipant" ADD CONSTRAINT "ContractFirstPartyRelatedParticipant_partiesId_fkey" FOREIGN KEY ("partiesId") REFERENCES "ContractParties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractFirstPartyRelatedParticipant" ADD CONSTRAINT "ContractFirstPartyRelatedParticipant_parentParticipantId_fkey" FOREIGN KEY ("parentParticipantId") REFERENCES "ContractFirstPartyRelatedParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

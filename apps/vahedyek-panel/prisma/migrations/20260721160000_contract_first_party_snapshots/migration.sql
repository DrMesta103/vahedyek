-- AlterTable
ALTER TABLE "ContractPartyMember" ADD COLUMN "snapshot" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "ContractFirstPartyRelatedParticipant"
ADD COLUMN "parentSourceId" TEXT,
ADD COLUMN "snapshot" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX "ContractFirstPartyRelatedParticipant_parent_source_idx"
ON "ContractFirstPartyRelatedParticipant"("partiesId", "parentSourceId");

-- Replace the draft-wide source uniqueness with parent-scoped uniqueness.
DROP INDEX "ContractFirstPartyRelatedParticipant_source_role_key";
CREATE UNIQUE INDEX "ContractFirstPartyRelatedParticipant_source_role_key"
ON "ContractFirstPartyRelatedParticipant"("partiesId", "parentSourceId", "role", "sourceId");

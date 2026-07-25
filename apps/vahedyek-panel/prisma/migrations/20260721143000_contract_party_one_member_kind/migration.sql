-- CreateEnum
CREATE TYPE "PartyOneMemberKind" AS ENUM ('business', 'natural_shareholder', 'legal_shareholder');

-- AlterTable
ALTER TABLE "ContractPartyMember" ADD COLUMN "partyOneMemberKind" "PartyOneMemberKind";

-- TerminationRules: JSONB storage for buyer termination configuration per draft
CREATE TABLE IF NOT EXISTS "TerminationRules" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "buyerRules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerminationRules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TerminationRules_draftId_key" ON "TerminationRules"("draftId");

CREATE INDEX IF NOT EXISTS "TerminationRules_draftId_idx" ON "TerminationRules"("draftId");

ALTER TABLE "TerminationRules" ADD CONSTRAINT "TerminationRules_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

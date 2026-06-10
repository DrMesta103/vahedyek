CREATE TABLE IF NOT EXISTS "ContractDraftRuleSettings" (
  "id" TEXT NOT NULL,
  "draftId" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContractDraftRuleSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_ruleId_key"
  ON "ContractDraftRuleSettings"("draftId", "ruleId");

CREATE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_idx"
  ON "ContractDraftRuleSettings"("draftId");

ALTER TABLE "ContractDraftRuleSettings"
  ADD CONSTRAINT "ContractDraftRuleSettings_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

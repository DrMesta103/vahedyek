-- Steps 7/8/9 storage tables: Extra costs, technical specs, attachments

CREATE TABLE IF NOT EXISTS "ContractExtraCosts" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractExtraCosts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractExtraCosts_draftId_key" ON "ContractExtraCosts"("draftId");
CREATE INDEX IF NOT EXISTS "ContractExtraCosts_draftId_idx" ON "ContractExtraCosts"("draftId");
ALTER TABLE "ContractExtraCosts"
  ADD CONSTRAINT "ContractExtraCosts_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE IF NOT EXISTS "ContractTechnicalSpecs" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTechnicalSpecs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractTechnicalSpecs_draftId_key" ON "ContractTechnicalSpecs"("draftId");
CREATE INDEX IF NOT EXISTS "ContractTechnicalSpecs_draftId_idx" ON "ContractTechnicalSpecs"("draftId");
ALTER TABLE "ContractTechnicalSpecs"
  ADD CONSTRAINT "ContractTechnicalSpecs_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE IF NOT EXISTS "ContractAttachments" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAttachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContractAttachments_draftId_key" ON "ContractAttachments"("draftId");
CREATE INDEX IF NOT EXISTS "ContractAttachments_draftId_idx" ON "ContractAttachments"("draftId");
ALTER TABLE "ContractAttachments"
  ADD CONSTRAINT "ContractAttachments_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;


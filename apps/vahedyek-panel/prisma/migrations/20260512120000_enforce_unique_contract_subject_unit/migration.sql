WITH ranked_subjects AS (
  SELECT
    cs."draftId",
    cs."unitId",
    ROW_NUMBER() OVER (
      PARTITION BY cs."unitId"
      ORDER BY random()
    ) AS row_no
  FROM "ContractSubject" cs
  WHERE cs."unitId" IS NOT NULL
),
duplicate_drafts AS (
  SELECT "draftId"
  FROM ranked_subjects
  WHERE row_no > 1
)
DELETE FROM "ContractDraft"
WHERE id IN (SELECT "draftId" FROM duplicate_drafts);

CREATE UNIQUE INDEX "ContractSubject_unitId_key" ON "ContractSubject"("unitId");

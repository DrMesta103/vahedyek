-- Refuse to add normalized uniqueness while conflicting legacy data exists.
-- No existing record is deleted or rewritten by this migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "OrganizationUnit"
    WHERE "code" IS NOT NULL AND btrim("code") <> ''
    GROUP BY COALESCE("tenantId", ''), lower(btrim("code"))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'Case-insensitive organization unit code conflicts must be resolved before this migration can run.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "OrganizationUnit"
    GROUP BY COALESCE("tenantId", ''), COALESCE("parentId", ''), lower(btrim("title"))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      MESSAGE = 'Same-level organization unit title conflicts must be resolved before this migration can run.';
  END IF;
END $$;

CREATE UNIQUE INDEX "OrganizationUnit_tenant_code_normalized_key"
ON "OrganizationUnit" (COALESCE("tenantId", ''), lower(btrim("code")))
WHERE "code" IS NOT NULL AND btrim("code") <> '';

CREATE UNIQUE INDEX "OrganizationUnit_tenant_parent_title_normalized_key"
ON "OrganizationUnit" (COALESCE("tenantId", ''), COALESCE("parentId", ''), lower(btrim("title")));

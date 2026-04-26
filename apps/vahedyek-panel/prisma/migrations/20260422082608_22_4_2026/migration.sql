DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Unit'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "Unit" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END $$;

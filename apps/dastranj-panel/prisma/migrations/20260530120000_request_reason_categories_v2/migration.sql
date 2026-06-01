-- Replace RequestReasonCategory enum with 11 categories in product order.

CREATE TYPE "RequestReasonCategory_new" AS ENUM (
  'daily_leave',
  'hourly_leave',
  'reward_leave',
  'unpaid_leave',
  'sick_leave',
  'overtime',
  'attendance',
  'remote_work',
  'mission',
  'salary_advance',
  'loan'
);

ALTER TABLE "RequestReason"
  ALTER COLUMN "category" TYPE "RequestReasonCategory_new"
  USING (
    CASE "category"::text
      WHEN 'annual_leave' THEN
        CASE
          WHEN "title" LIKE '%ساعتی%' THEN 'hourly_leave'::"RequestReasonCategory_new"
          ELSE 'daily_leave'::"RequestReasonCategory_new"
        END
      WHEN 'reward_leave' THEN 'reward_leave'::"RequestReasonCategory_new"
      WHEN 'unpaid_leave' THEN 'unpaid_leave'::"RequestReasonCategory_new"
      WHEN 'sick_leave' THEN 'sick_leave'::"RequestReasonCategory_new"
      WHEN 'attendance' THEN 'attendance'::"RequestReasonCategory_new"
      WHEN 'remote_work' THEN 'remote_work'::"RequestReasonCategory_new"
      WHEN 'mission' THEN 'mission'::"RequestReasonCategory_new"
      WHEN 'salary_advance' THEN 'salary_advance'::"RequestReasonCategory_new"
      WHEN 'loan' THEN 'loan'::"RequestReasonCategory_new"
      ELSE 'daily_leave'::"RequestReasonCategory_new"
    END
  );

DROP TYPE "RequestReasonCategory";

ALTER TYPE "RequestReasonCategory_new" RENAME TO "RequestReasonCategory";

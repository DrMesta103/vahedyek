-- اگر برای یک tenant هیچ عضوی با role = owner ثبت نشده، قدیمی‌ترین عضویت را به مالک ارتقا می‌دهد (گاهی پس از مهاجرت یا ورود دادهٔ قدیمی رخ می‌دهد).

WITH "pick" AS (
  SELECT m."id"
  FROM "UserTenantMembership" AS m
  WHERE m."role" <> 'owner'
    AND NOT EXISTS (
      SELECT 1
      FROM "UserTenantMembership" AS o
      WHERE o."tenantId" = m."tenantId" AND o."role" = 'owner'
    )
    AND m."id" = (
      SELECT m2."id"
      FROM "UserTenantMembership" AS m2
      WHERE m2."tenantId" = m."tenantId"
      ORDER BY m2."createdAt" ASC
      LIMIT 1
    )
)
UPDATE "UserTenantMembership" AS u
SET "role" = 'owner'
FROM "pick"
WHERE u."id" = "pick"."id";

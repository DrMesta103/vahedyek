SELECT 'AppUser' AS table_name, COUNT(*) FROM "AppUser"
UNION ALL
SELECT 'Tenant', COUNT(*) FROM "Tenant"
UNION ALL
SELECT 'Membership', COUNT(*) FROM "UserTenantMembership";
SELECT id, name, email, mobile FROM "AppUser"
WHERE mobile IN ('9177012406','09177012406','989177012406','+989177012406')
   OR REPLACE(COALESCE(mobile,''), '+98', '') IN ('9177012406','09177012406');

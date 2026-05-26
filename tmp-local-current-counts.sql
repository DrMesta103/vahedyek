SELECT 'AppUser' AS table_name, COUNT(*) FROM "AppUser"
UNION ALL
SELECT 'Tenant', COUNT(*) FROM "Tenant"
UNION ALL
SELECT 'Membership', COUNT(*) FROM "UserTenantMembership";

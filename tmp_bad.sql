SELECT 'local' AS src, (SELECT count(*) FROM "Tenant") AS tenants, (SELECT count(*) FROM "AppUser") AS users, (SELECT count(*) FROM "UserTenantMembership") AS memberships, (SELECT count(*) FROM "TenantRole") AS roles
UNION ALL
SELECT 'prod' AS src, (SELECT count(*) FROM dblink('dbname=merge_src_prod host=127.0.0.1 user=postgres password=8R5zeQo6zh1hSfUhbLwttepTB78TT9bZ5b1LF88jUbrGUiGg4YwWii6V1VG8XXWe','select count(*) from "Tenant"') AS t(count bigint)),
       (SELECT count(*) FROM dblink('dbname=merge_src_prod host=127.0.0.1 user=postgres password=8R5zeQo6zh1hSfUhbLwttepTB78TT9bZ5b1LF88jUbrGUiGg4YwWii6V1VG8XXWe','select count(*) from "AppUser"') AS t(count bigint)),
       (SELECT count(*) FROM dblink('dbname=merge_src_prod host=127.0.0.1 user=postgres password=8R5zeQo6zh1hSfUhbLwttepTB78TT9bZ5b1LF88jUbrGUiGg4YwWii6V1VG8XXWe','select count(*) from "UserTenantMembership"') AS t(count bigint)),
       (SELECT count(*) FROM dblink('dbname=merge_src_prod host=127.0.0.1 user=postgres password=8R5zeQo6zh1hSfUhbLwttepTB78TT9bZ5b1LF88jUbrGUiGg4YwWii6V1VG8XXWe','select count(*) from "TenantRole"') AS t(count bigint));

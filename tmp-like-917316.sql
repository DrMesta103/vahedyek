SELECT id, email, "fullName", mobile FROM "AppUser"
WHERE COALESCE(mobile,'') LIKE '%917316%'
ORDER BY mobile;

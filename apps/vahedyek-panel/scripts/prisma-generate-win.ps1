<#
.SYNOPSIS
  Fixes Prisma EPERM rename on Windows: optionally stops Node (releases query_engine DLL lock),
  removes hoisted `node_modules/.prisma`, then runs prisma generate.

.PARAMETER KillAllNode
  Stops every Node process on this PC (closes dev servers, Prisma Studio, sometimes IDE helpers).
  Use when Access denied persists on deleting query_engine-windows.dll.node.

USAGE
  npm run prisma:generate:win
  npm run prisma:generate:win:hard
#>
param(
  [switch] $KillAllNode
)

$ErrorActionPreference = "Stop"

$panelRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$dotPrisma = Join-Path $repoRoot "node_modules\.prisma"

Write-Host "Panel: $panelRoot"
Write-Host "Repo:  $repoRoot"

if ($KillAllNode) {
  Write-Host "Stopping Node processes so Prisma DLL is not locked..."
  Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 2
}

if (Test-Path -LiteralPath $dotPrisma) {
  Write-Host "Removing Prisma folder: $dotPrisma"
  Remove-Item -LiteralPath $dotPrisma -Recurse -Force
}

Push-Location $panelRoot
try {
  Write-Host "Running prisma generate..."
  npx prisma generate
} finally {
  Pop-Location
}

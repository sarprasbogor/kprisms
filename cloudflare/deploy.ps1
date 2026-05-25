# Deploy KPRI SMS to Cloudflare
param(
  [switch]$Schema,
  [switch]$Seed,
  [switch]$Worker,
  [switch]$Frontend,
  [switch]$All
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if ($All -or $Schema) {
  Write-Host "=== Setting up D1 schema ===" -ForegroundColor Green
  cd "$root\worker"
  $dbId = (npx wrangler d1 create kpri-sms-db 2>&1 | Select-String "database_id" | ForEach-Object { $_ -replace '.*database_id = "([^"]+)".*', '$1' })
  if (-not $dbId) {
    # DB already exists — get its ID
    $dbId = (npx wrangler d1 list 2>&1 | Select-String "kpri-sms-db" | ForEach-Object { $_ -replace '.*│ ([a-f0-9-]+) │.*', '$1' })
  }
  Write-Host "Database ID: $dbId" -ForegroundColor Yellow
  
  # Update wrangler.toml
  $toml = Get-Content "$root\worker\wrangler.toml" -Raw
  $toml = $toml -replace 'database_id = ""', "database_id = `"$dbId`""
  Set-Content "$root\worker\wrangler.toml" $toml
  
  # Apply schema + seed
  npx wrangler d1 execute kpri-sms-db --file=../data/schema.sql
  npx wrangler d1 execute kpri-sms-db --file=../data/seed.sql
  Write-Host "Schema + seed applied!" -ForegroundColor Green
}

if ($All -or $Worker) {
  Write-Host "=== Deploying Worker ===" -ForegroundColor Green
  cd "$root\worker"
  npx wrangler deploy src/index.ts
  Write-Host "Worker deployed!" -ForegroundColor Green
}

if ($All -or $Frontend) {
  Write-Host "=== Building & deploying Frontend ===" -ForegroundColor Green
  cd "$root\frontend"
  npm run build
  npx wrangler pages deploy dist --project-name kpri-sms-frontend
  Write-Host "Frontend deployed!" -ForegroundColor Green
}

if (-not ($All -or $Schema -or $Seed -or $Worker -or $Frontend)) {
  Write-Host @"
Usage: .\deploy.ps1 [-Schema] [-Seed] [-Worker] [-Frontend] [-All]

  -Schema    Setup D1 database + schema
  -Seed      Import data to D1
  -Worker    Deploy Hono API worker
  -Frontend  Build & deploy frontend to Pages
  -All       Deploy everything

Examples:
  .\deploy.ps1 -All           # First time deployment
  .\deploy.ps1 -Worker         # Update worker only
  .\deploy.ps1 -Frontend       # Update frontend only
"@
}

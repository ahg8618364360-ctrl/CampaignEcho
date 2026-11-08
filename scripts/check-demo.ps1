# CampaignEcho -- Pre-Flight System and Readiness Diagnostic
# Strictly verifies prerequisites and exits with code 1 on failure, 0 on success.

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $rootPath

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CampaignEcho -- Demonstration Readiness Check" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$allPassed = $true

# 1. Check Python Virtual Environment
Write-Host ""
Write-Host "[1/4] Checking Python Virtual Environment..." -NoNewline
$pythonExe = "$rootPath\venv\Scripts\python.exe"
if (Test-Path $pythonExe) {
    $pyVer = & $pythonExe --version 2>&1
    Write-Host " [OK] ($pyVer)" -ForegroundColor Green
} else {
    Write-Host " [FAIL] (venv not found at $pythonExe. Run: python -m venv venv && pip install -r backend/requirements.txt)" -ForegroundColor Red
    $allPassed = $false
}

# 2. Check Node and Frontend Dependencies
Write-Host "[2/4] Checking Frontend Environment..." -NoNewline
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host " [FAIL] (Node.js executable not found in PATH)" -ForegroundColor Red
    $allPassed = $false
} elseif (-not (Test-Path "$rootPath\frontend\node_modules")) {
    Write-Host " [FAIL] (frontend/node_modules missing. Run 'cd frontend && npm install')" -ForegroundColor Red
    $allPassed = $false
} else {
    $nodeVer = & node --version 2>&1
    Write-Host " [OK] ($nodeVer; node_modules present)" -ForegroundColor Green
}

# 3. Check Deep Configuration, Database, and Live APIs
Write-Host "[3/4] Running Deep Configuration & Live API Diagnostic..."
if ($allPassed) {
    & $pythonExe "$rootPath\scripts\verify_readiness.py"
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [FAIL] Diagnostic detected invalid configuration or unreachable APIs." -ForegroundColor Red
        $allPassed = $false
    } else {
        Write-Host " [OK] Deep configuration, DB schema, and API authentications verified." -ForegroundColor Green
    }
} else {
    Write-Host " [SKIPPED] Skipping API checks due to missing environment prerequisites." -ForegroundColor Yellow
}

# 4. Check Port Bindings
Write-Host ""
Write-Host "[4/4] Checking Local Port Bindings..."
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($port8000) {
    $pid8000 = $port8000[0].OwningProcess
    Write-Host "  - Port 8000 (Backend): LISTENING (PID $pid8000)" -ForegroundColor Yellow
} else {
    Write-Host "  - Port 8000 (Backend): AVAILABLE" -ForegroundColor Green
}

if ($port3000) {
    $pid3000 = $port3000[0].OwningProcess
    Write-Host "  - Port 3000 (Frontend): LISTENING (PID $pid3000)" -ForegroundColor Yellow
} else {
    Write-Host "  - Port 3000 (Frontend): AVAILABLE" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  STATUS: READY TO LAUNCH DEMONSTRATION" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  STATUS: PRE-FLIGHT CHECKS FAILED (Fix errors above before launch)" -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 1
}

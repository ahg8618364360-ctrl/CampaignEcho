# CampaignEcho -- Pre-Flight System and Readiness Diagnostic
# Strictly verifies prerequisites and exits with code 1 on failure, 0 on success.

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $rootPath

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CampaignEcho -- Demonstration Readiness Check" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$allPassed = $true

# 1. Check Python Virtual Environment & Version (>= 3.11)
Write-Host ""
Write-Host "[1/4] Checking Python Virtual Environment (>= 3.11)..." -NoNewline
$pythonExe = "$rootPath\venv\Scripts\python.exe"
if (Test-Path $pythonExe) {
    $pyVerRaw = & $pythonExe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>&1
    if ($pyVerRaw -match '^(\d+)\.(\d+)') {
        $pyMajor = [int]$Matches[1]
        $pyMinor = [int]$Matches[2]
        if ($pyMajor -gt 3 -or ($pyMajor -eq 3 -and $pyMinor -ge 11)) {
            Write-Host " [OK] (Python $pyVerRaw >= 3.11)" -ForegroundColor Green
        } else {
            Write-Host " [FAIL] (Python $pyVerRaw is below required minimum >= 3.11)" -ForegroundColor Red
            $allPassed = $false
        }
    } else {
        Write-Host " [FAIL] (Unable to determine Python version from '$pyVerRaw')" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host " [FAIL] (venv not found at $pythonExe. Run: python -m venv venv && pip install -e .)" -ForegroundColor Red
    $allPassed = $false
}

# 2. Check Node Environment (>= 20) and Dependencies
Write-Host "[2/4] Checking Node.js Environment (>= 20) & Dependencies..." -NoNewline
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host " [FAIL] (Node.js executable not found in PATH)" -ForegroundColor Red
    $allPassed = $false
} elseif (-not (Test-Path "$rootPath\frontend\node_modules")) {
    Write-Host " [FAIL] (frontend/node_modules missing. Run 'cd frontend && npm install')" -ForegroundColor Red
    $allPassed = $false
} else {
    $nodeVerRaw = & node -v 2>&1
    if ($nodeVerRaw -match '^v(\d+)\.') {
        $nodeMajor = [int]$Matches[1]
        if ($nodeMajor -ge 20) {
            Write-Host " [OK] (Node.js $nodeVerRaw >= 20; node_modules present)" -ForegroundColor Green
        } else {
            Write-Host " [FAIL] (Node.js $nodeVerRaw is below required minimum >= 20)" -ForegroundColor Red
            $allPassed = $false
        }
    } else {
        Write-Host " [FAIL] (Unable to determine Node version from '$nodeVerRaw')" -ForegroundColor Red
        $allPassed = $false
    }
}

# 3. Check Deep Configuration, Database (8/8 Tables), and Live APIs
Write-Host "`n[3/4] Running Deep Configuration, Database & Cloud API Diagnostic..."
if ($allPassed) {
    & $pythonExe "$rootPath\scripts\verify_readiness.py"
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [FAIL] Diagnostic detected invalid configuration, missing tables, or unreachable APIs." -ForegroundColor Red
        $allPassed = $false
    } else {
        Write-Host " [OK] Deep configuration, 9/9 DB schema tables, and API authentications verified." -ForegroundColor Green
    }
} else {
    Write-Host " [SKIPPED] Skipping API checks due to missing runtime prerequisites." -ForegroundColor Yellow
}

# 4. Check Port Bindings
Write-Host ""
Write-Host "[4/4] Checking Local Port Bindings (8000 & 3000)..."
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

$ownershipFile = "$PSScriptRoot\demo-ownership.json"
$ownership = $null
if (Test-Path $ownershipFile) {
    try { $ownership = Get-Content $ownershipFile -Raw | ConvertFrom-Json } catch {}
}

if ($port8000) {
    $pid8000 = $port8000[0].OwningProcess
    $isOwned = $ownership -and $ownership.backend -and ($ownership.backend.pid -eq $pid8000)
    if ($isOwned) {
        Write-Host "  - Port 8000: [ACTIVE] Listener PID $pid8000 (Verified CampaignEcho Backend)" -ForegroundColor Green
    } else {
        Write-Host "  - Port 8000: [OCCUPIED] Listener PID $pid8000 (UNVERIFIED EXTERNAL APPLICATION)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  - Port 8000: [FREE] Available for CampaignEcho Backend" -ForegroundColor Gray
}

if ($port3000) {
    $pid3000 = $port3000[0].OwningProcess
    $isOwned = $ownership -and $ownership.frontend -and ($ownership.frontend.pid -eq $pid3000)
    if ($isOwned) {
        Write-Host "  - Port 3000: [ACTIVE] Listener PID $pid3000 (Verified CampaignEcho Frontend)" -ForegroundColor Green
    } else {
        Write-Host "  - Port 3000: [OCCUPIED] Listener PID $pid3000 (UNVERIFIED EXTERNAL APPLICATION)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  - Port 3000: [FREE] Available for CampaignEcho Frontend" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  All Pre-Flight Diagnostics Passed. System is DEMO-READY." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  Diagnostics Failed. Resolve prerequisite issues above." -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 1
}

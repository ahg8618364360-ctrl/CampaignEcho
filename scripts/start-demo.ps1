# CampaignEcho — Automated One-Command Demonstration Startup

$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $rootPath

# Run readiness diagnostic first
& "$PSScriptRoot\check-demo.ps1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting CampaignEcho Services..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure DB migrations are up to date
$pythonExe = "$rootPath\venv\Scripts\python.exe"
$alembicExe = "$rootPath\venv\Scripts\alembic.exe"
if (Test-Path $alembicExe) {
    Write-Host "`n[1/3] Ensuring Database Schema is Head..." -NoNewline
    & $alembicExe -c "$rootPath\backend\alembic.ini" upgrade head 2>&1 | Out-Null
    Write-Host " [OK]" -ForegroundColor Green
}

# 2. Start FastAPI Backend Daemon if not already running on port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $port8000) {
    Write-Host "[2/3] Launching FastAPI Backend Daemon (127.0.0.1:8000)..." -NoNewline
    $uvicornExe = "$rootPath\venv\Scripts\uvicorn.exe"
    $backendProcess = Start-Process -FilePath $uvicornExe -ArgumentList "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000" -PassThru -WindowStyle Hidden
    $backendProcess.Id | Out-File "$PSScriptRoot\backend.pid" -Encoding ascii
    
    # Wait for backend readiness
    $ready = $false
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/health/ready" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.status -eq "ready") {
                $ready = $true
                break
            }
        } catch {}
    }
    if ($ready) {
        Write-Host " [ONLINE] (PID $($backendProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host " [STARTED (Awaiting warm-up)]" -ForegroundColor Yellow
    }
} else {
    Write-Host "[2/3] FastAPI Backend already running on port 8000 (PID $($port8000[0].OwningProcess))" -ForegroundColor Green
}

# 3. Start Next.js Frontend Server if not already running on port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Host "[3/3] Launching Next.js Production Server (localhost:3000)..." -NoNewline
    $frontendDir = "$rootPath\frontend"
    $npmCmd = "npm.cmd"
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d $frontendDir && npm.cmd start" -PassThru -WindowStyle Hidden
    $frontendProcess.Id | Out-File "$PSScriptRoot\frontend.pid" -Encoding ascii
    
    # Wait for frontend readiness
    $feReady = $false
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        try {
            $feResp = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($feResp.StatusCode -eq 200) {
                $feReady = $true
                break
            }
        } catch {}
    }
    if ($feReady) {
        Write-Host " [ONLINE] (PID $($frontendProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host " [STARTED (Awaiting warm-up)]" -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/3] Next.js Frontend already running on port 3000 (PID $($port3000[0].OwningProcess))" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  ✦ CampaignEcho Demonstration Workspace is Active" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  • Web Workspace (App):      http://localhost:3000" -ForegroundColor White
Write-Host "  • Memory Evolution (A/B):   http://localhost:3000/memory-evolution" -ForegroundColor White
Write-Host "  • Campaign Studio:          http://localhost:3000/campaign-studio" -ForegroundColor White
Write-Host "  • Memory Explorer:          http://localhost:3000/memory-explorer" -ForegroundColor White
Write-Host "  • Backend Health & Ready:   http://127.0.0.1:8000/api/v1/health/ready" -ForegroundColor White
Write-Host "  • Swagger API Explorer:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "To stop the servers gracefully, run: .\scripts\stop-demo.ps1`n" -ForegroundColor Gray


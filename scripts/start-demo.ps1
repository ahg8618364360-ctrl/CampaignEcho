# CampaignEcho — Automated One-Command Demonstration Startup
# Enforces strict prerequisite verification, checks migration exit codes,
# validates genuine health responses before reporting online, and records safe ownership metadata.

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $rootPath

# 1. Run readiness diagnostic first and require exit code 0
Write-Host "Running pre-flight system diagnostics..." -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\check-demo.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ABORT] Pre-flight checks failed with exit code $LASTEXITCODE. Startup halted." -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Launching CampaignEcho Demonstration Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. Ensure DB migrations are up to date and verify exit code
$pythonExe = "$rootPath\venv\Scripts\python.exe"
$alembicExe = "$rootPath\venv\Scripts\alembic.exe"
if (Test-Path $alembicExe) {
    Write-Host "`n[1/3] Applying Database Migrations (alembic upgrade head)..." -NoNewline
    $migOutput = & $alembicExe -c "$rootPath\backend\alembic.ini" upgrade head 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "Migration error output:" -ForegroundColor Red
        Write-Host $migOutput
        exit 1
    }
    Write-Host " [OK] (Schema up to date)" -ForegroundColor Green
} else {
    Write-Host "`n[1/3] [FAIL] alembic.exe not found in virtual environment." -ForegroundColor Red
    exit 1
}

# Ownership tracking hash
$ownership = @{
    "backend" = $null
    "frontend" = $null
}

# Load existing ownership if present
$ownershipFile = "$PSScriptRoot\demo-ownership.json"
if (Test-Path $ownershipFile) {
    try {
        $existing = Get-Content $ownershipFile -Raw | ConvertFrom-Json
        if ($existing.backend) { $ownership["backend"] = $existing.backend }
        if ($existing.frontend) { $ownership["frontend"] = $existing.frontend }
    } catch {}
}

# 3. Start FastAPI Backend Daemon if not already running on port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $port8000) {
    Write-Host "[2/3] Launching FastAPI Backend Daemon (127.0.0.1:8000)..." -NoNewline
    $uvicornExe = "$rootPath\venv\Scripts\uvicorn.exe"
    $backendProcess = Start-Process -FilePath $uvicornExe -ArgumentList "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000" -PassThru -WindowStyle Hidden
    
    # Wait for genuine backend readiness
    $ready = $false
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/health/ready" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.status -eq "ready" -and $resp.database -eq "connected") {
                $ready = $true
                break
            }
        } catch {}
    }
    
    if ($ready) {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($backendProcess.Id)").CommandLine
        $ownership["backend"] = @{
            "pid" = $backendProcess.Id
            "port" = 8000
            "command" = $cmdLine
            "started_at" = (Get-Date).ToString("o")
        }
        $backendProcess.Id | Out-File "$PSScriptRoot\backend.pid" -Encoding ascii
        Write-Host " [ONLINE] (PID $($backendProcess.Id), HTTP 200 /health/ready)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Backend failed to report ready on http://127.0.0.1:8000/api/v1/health/ready within 20s." -ForegroundColor Red
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    $existingPid = $port8000[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$existingPid"
    if ($proc -and ($proc.CommandLine -match "uvicorn|backend\.app\.main")) {
        Write-Host "[2/3] FastAPI Backend already running on port 8000 (PID $existingPid)" -ForegroundColor Green
        $ownership["backend"] = @{
            "pid" = $existingPid
            "port" = 8000
            "command" = $proc.CommandLine
            "started_at" = (Get-Date).ToString("o")
        }
        $existingPid | Out-File "$PSScriptRoot\backend.pid" -Encoding ascii
    } else {
        Write-Host "[2/3] [FAIL] Port 8000 is occupied by an unverified process (PID ${existingPid} - $($proc.Name)). Free port 8000 first." -ForegroundColor Red
        exit 1
    }
}

# 4. Check Frontend Build and Start Next.js Server on port 3000
$frontendDir = "$rootPath\frontend"
if (-not (Test-Path "$frontendDir\.next")) {
    Write-Host "`n[3/3] Next.js production build not found. Running 'npm run build'..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm.cmd run build
    Pop-Location
    if (-not (Test-Path "$frontendDir\.next")) {
        Write-Host "[3/3] [FAIL] Frontend production build failed." -ForegroundColor Red
        exit 1
    }
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Host "[3/3] Launching Next.js Production Server (localhost:3000)..." -NoNewline
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d $frontendDir && npm.cmd start" -PassThru -WindowStyle Hidden
    
    # Wait for genuine frontend HTTP response
    $feReady = $false
    for ($i = 0; $i -lt 25; $i++) {
        Start-Sleep -Seconds 1
        try {
            $feResp = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($feResp.StatusCode -eq 200) {
                $feReady = $true
                break
            }
        } catch {}
    }
    
    if ($feReady) {
        $p3000Now = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
        $activePid = if ($p3000Now) { $p3000Now[0].OwningProcess } else { $frontendProcess.Id }
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$activePid").CommandLine
        $ownership["frontend"] = @{
            "pid" = $activePid
            "parent_pid" = $frontendProcess.Id
            "port" = 3000
            "command" = $cmdLine
            "started_at" = (Get-Date).ToString("o")
        }
        $activePid | Out-File "$PSScriptRoot\frontend.pid" -Encoding ascii
        Write-Host " [ONLINE] (PID $activePid, HTTP 200 on port 3000)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Frontend server failed to respond on http://localhost:3000 within 25s." -ForegroundColor Red
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    $existingPid = $port3000[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$existingPid"
    if ($proc -and ($proc.CommandLine -match "next|node")) {
        Write-Host "[3/3] Next.js Frontend already running on port 3000 (PID $existingPid)" -ForegroundColor Green
        $ownership["frontend"] = @{
            "pid" = $existingPid
            "port" = 3000
            "command" = $proc.CommandLine
            "started_at" = (Get-Date).ToString("o")
        }
        $existingPid | Out-File "$PSScriptRoot\frontend.pid" -Encoding ascii
    } else {
        Write-Host "[3/3] [FAIL] Port 3000 is occupied by an unverified process (PID ${existingPid} - $($proc.Name)). Free port 3000 first." -ForegroundColor Red
        exit 1
    }
}

# Persist verified ownership JSON
$ownership | ConvertTo-Json -Depth 4 | Out-File $ownershipFile -Encoding ascii

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
Write-Host "To stop the servers safely, run: .\scripts\stop-demo.ps1`n" -ForegroundColor Gray

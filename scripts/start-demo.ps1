# CampaignEcho — Automated Demonstration Startup Script
# Enforces preflight checks, database migrations, process ownership, and readiness verification.
# Refuses to adopt external processes on ports 8000/3000, and performs clean rollback on failure.

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
$normalizedRoot = $rootPath.Replace('/', '\').TrimEnd('\')
Set-Location $rootPath

# 1. Run Pre-flight Diagnostic Check
Write-Host "Running pre-flight diagnostics..." -ForegroundColor Cyan
& powershell.exe -ExecutionPolicy Bypass -File "$PSScriptRoot\check-demo.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FATAL] Pre-flight readiness check failed. Halting startup." -ForegroundColor Red
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

# Generate a unique per-launch ownership token
$launchToken = [guid]::NewGuid().ToString("N")

# Ownership tracking hash
$ownershipFile = "$PSScriptRoot\demo-ownership.json"
$existingOwnership = $null
if (Test-Path $ownershipFile) {
    try {
        $existingOwnership = Get-Content $ownershipFile -Raw | ConvertFrom-Json
    } catch {}
}

$ownership = @{
    "version" = "2.0"
    "project_root" = $normalizedRoot
    "launch_token" = $launchToken
    "backend" = $null
    "frontend" = $null
}

$startedBackendInThisRun = $false
$backendProcess = $null

# 3. Check / Start FastAPI Backend on port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $port8000) {
    Write-Host "`n[2/3] Launching FastAPI Backend Daemon (127.0.0.1:8000)..." -NoNewline
    $uvicornExe = "$rootPath\venv\Scripts\uvicorn.exe"
    
    # Launch uvicorn with explicit app-dir and custom ownership header
    $backendProcess = Start-Process -FilePath $uvicornExe -ArgumentList "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--app-dir", "`"$rootPath`"", "--header", "`"X-CampaignEcho-Token:$launchToken`"" -PassThru -WindowStyle Hidden
    $startedBackendInThisRun = $true

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
            "executable" = $uvicornExe
            "command" = $cmdLine
            "launch_token" = $launchToken
            "started_at" = (Get-Date).ToString("o")
        }
        $backendProcess.Id | Out-File "$PSScriptRoot\backend.pid" -Encoding ascii
        Write-Host " [ONLINE] (PID $($backendProcess.Id), HTTP 200 /health/ready, Token verified)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Backend failed to report ready on http://127.0.0.1:8000/api/v1/health/ready within 20s." -ForegroundColor Red
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    $existingPid = $port8000[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$existingPid" -ErrorAction SilentlyContinue
    
    # Strict verification before reusing an already-running instance:
    # Must match project root, python/uvicorn, backend.app.main:app, AND must match recorded launch_token from demo-ownership.json
    $normCmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine.Replace('/','\') } else { "" }
    $recordedToken = if ($existingOwnership -and $existingOwnership.backend -and $existingOwnership.backend.pid -eq $existingPid) { $existingOwnership.backend.launch_token } else { $null }

    $isVerifiedBackend = $proc -and ($proc.Name -match '^(python|uvicorn)\.exe$') -and `
        $normCmd.Contains($normalizedRoot) -and `
        ($proc.CommandLine -match 'backend\.app\.main:app') -and `
        (-not [string]::IsNullOrWhiteSpace($recordedToken)) -and `
        ($proc.CommandLine.Contains($recordedToken))

    if ($isVerifiedBackend) {
        Write-Host "`n[2/3] FastAPI Backend already running under verified CampaignEcho ownership (PID $existingPid, Token $recordedToken)" -ForegroundColor Green
        $ownership["backend"] = @{
            "pid" = $existingPid
            "port" = 8000
            "executable" = $proc.ExecutablePath
            "command" = $proc.CommandLine
            "launch_token" = $recordedToken
            "started_at" = if ($existingOwnership.backend.started_at) { $existingOwnership.backend.started_at } else { (Get-Date).ToString("o") }
        }
        $existingPid | Out-File "$PSScriptRoot\backend.pid" -Encoding ascii
    } else {
        Write-Host "`n[2/3] [FAIL] Port 8000 is occupied by an unverified process (PID ${existingPid} - $($proc.Name))." -ForegroundColor Red
        Write-Host "      Refusing to adopt external process. Free port 8000 before running." -ForegroundColor Red
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
        if ($startedBackendInThisRun -and $backendProcess) {
            Write-Host "Rolling back newly launched backend process (PID $($backendProcess.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

$startedFrontendInThisRun = $false
$frontendProcess = $null
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if (-not $port3000) {
    Write-Host "`n[3/3] Launching Next.js Production Server (localhost:3000)..." -NoNewline
    $nodeExe = (Get-Command node).Source
    $nextCli = "$frontendDir\node_modules\next\dist\bin\next"

    # Launch node directly with title token, next start and exact frontend directory
    $frontendProcess = Start-Process -FilePath $nodeExe -ArgumentList "--title=CampaignEcho-$launchToken", "`"$nextCli`"", "start", "`"$frontendDir`"", "-p", "3000" -WorkingDirectory $frontendDir -PassThru -WindowStyle Hidden
    $startedFrontendInThisRun = $true

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
            "port" = 3000
            "executable" = $nodeExe
            "command" = $cmdLine
            "launch_token" = $launchToken
            "started_at" = (Get-Date).ToString("o")
        }
        $activePid | Out-File "$PSScriptRoot\frontend.pid" -Encoding ascii
        Write-Host " [ONLINE] (PID $activePid, HTTP 200 on port 3000, Token verified)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Frontend server failed to respond on http://localhost:3000 within 25s." -ForegroundColor Red
        # Roll back frontend AND backend started in this run
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        if ($startedBackendInThisRun -and $backendProcess) {
            Write-Host "Rolling back newly launched backend process (PID $($backendProcess.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
            Remove-Item "$PSScriptRoot\backend.pid" -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
} else {
    $existingPid = $port3000[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$existingPid" -ErrorAction SilentlyContinue
    
    # Strict verification before reusing: must be node.exe, project frontend dir, AND must match recorded launch_token from demo-ownership.json
    $normCmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine.Replace('/','\') } else { "" }
    $recordedToken = if ($existingOwnership -and $existingOwnership.frontend -and $existingOwnership.frontend.pid -eq $existingPid) { $existingOwnership.frontend.launch_token } else { $null }

    $isVerifiedFrontend = $proc -and ($proc.Name -eq "node.exe") -and `
        $normCmd.Contains("$normalizedRoot\frontend") -and `
        (-not [string]::IsNullOrWhiteSpace($recordedToken)) -and `
        ($proc.CommandLine.Contains($recordedToken))

    if ($isVerifiedFrontend) {
        Write-Host "`n[3/3] Next.js Frontend already running under verified CampaignEcho ownership (PID $existingPid, Token $recordedToken)" -ForegroundColor Green
        $ownership["frontend"] = @{
            "pid" = $existingPid
            "port" = 3000
            "executable" = $proc.ExecutablePath
            "command" = $proc.CommandLine
            "launch_token" = $recordedToken
            "started_at" = if ($existingOwnership.frontend.started_at) { $existingOwnership.frontend.started_at } else { (Get-Date).ToString("o") }
        }
        $existingPid | Out-File "$PSScriptRoot\frontend.pid" -Encoding ascii
    } else {
        Write-Host "`n[3/3] [FAIL] Port 3000 is occupied by an unverified process (PID ${existingPid} - $($proc.Name))." -ForegroundColor Red
        Write-Host "      Refusing to adopt external process. Free port 3000 before running." -ForegroundColor Red
        if ($startedBackendInThisRun -and $backendProcess) {
            Write-Host "Rolling back newly launched backend process (PID $($backendProcess.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
            Remove-Item "$PSScriptRoot\backend.pid" -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# Persist verified ownership JSON
$ownership | ConvertTo-Json -Depth 4 | Out-File $ownershipFile -Encoding ascii

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  ✦ CampaignEcho Demonstration Workspace is Active" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Backend API   : http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  Frontend App  : http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Launch Token  : $launchToken" -ForegroundColor Gray
Write-Host "  Safe Stop     : Run 'scripts\stop-demo.ps1'" -ForegroundColor Cyan
Write-Host "==========================================================`n" -ForegroundColor Green
exit 0

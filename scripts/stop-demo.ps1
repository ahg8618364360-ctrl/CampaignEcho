# CampaignEcho — Automated Demonstration Shutdown Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Stopping CampaignEcho Demonstration Daemons..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Terminate tracked backend process if pid file exists
if (Test-Path "$PSScriptRoot\backend.pid") {
    $backendPid = (Get-Content "$PSScriptRoot\backend.pid").Trim()
    if ($backendPid) {
        Write-Host "Stopping FastAPI backend (PID $backendPid)..." -NoNewline
        try {
            Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
            Write-Host " [TERMINATED]" -ForegroundColor Green
        } catch {
            Write-Host " [NOT RUNNING]" -ForegroundColor Gray
        }
    }
    Remove-Item "$PSScriptRoot\backend.pid" -Force -ErrorAction SilentlyContinue
}

# 2. Terminate tracked frontend process if pid file exists
if (Test-Path "$PSScriptRoot\frontend.pid") {
    $frontendPid = (Get-Content "$PSScriptRoot\frontend.pid").Trim()
    if ($frontendPid) {
        Write-Host "Stopping Next.js frontend (PID $frontendPid)..." -NoNewline
        try {
            Stop-Process -Id $frontendPid -Force -ErrorAction SilentlyContinue
            Write-Host " [TERMINATED]" -ForegroundColor Green
        } catch {
            Write-Host " [NOT RUNNING]" -ForegroundColor Gray
        }
    }
    Remove-Item "$PSScriptRoot\frontend.pid" -Force -ErrorAction SilentlyContinue
}

# 3. Check for lingering processes listening strictly on 8000 or 3000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    $p = Get-Process -Id $port8000[0].OwningProcess -ErrorAction SilentlyContinue
    if ($p -and ($p.ProcessName -match "python|uvicorn")) {
        Write-Host "Stopping lingering backend process (PID $($p.Id))..." -NoNewline
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        Write-Host " [CLEANED]" -ForegroundColor Green
    }
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $p = Get-Process -Id $port3000[0].OwningProcess -ErrorAction SilentlyContinue
    if ($p -and ($p.ProcessName -match "node|cmd")) {
        Write-Host "Stopping lingering frontend process (PID $($p.Id))..." -NoNewline
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        Write-Host " [CLEANED]" -ForegroundColor Green
    }
}

Write-Host "`nAll CampaignEcho demonstration services stopped cleanly.`n" -ForegroundColor Green


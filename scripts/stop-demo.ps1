# CampaignEcho — Automated Demonstration Safe Shutdown Script
# Verifies process ownership and command-line identity before terminating.
# Safely ignores stale or reused PIDs and refuses to kill unrelated processes.

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Stopping CampaignEcho Demonstration Services Safely" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ownershipFile = "$PSScriptRoot\demo-ownership.json"
$ownership = $null
if (Test-Path $ownershipFile) {
    try {
        $ownership = Get-Content $ownershipFile -Raw | ConvertFrom-Json
    } catch {}
}

# Helper to verify and terminate a process safely
function Stop-VerifiedProcess {
    param(
        [int]$ProcessId,
        [string]$ExpectedPattern,
        [string]$RoleName
    )

    if ($ProcessId -le 0) { return }

    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "  - $RoleName (PID $ProcessId): [NOT RUNNING / STALE PID]" -ForegroundColor Gray
        return
    }

    $cmdLine = $proc.CommandLine
    if ($cmdLine -match $ExpectedPattern) {
        Write-Host "  - $RoleName (PID $ProcessId; verified '$($proc.Name)'): Terminating..." -NoNewline
        try {
            # Terminate child processes first if any
            $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue
            foreach ($child in $children) {
                if ($child.CommandLine -match $ExpectedPattern) {
                    Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
                }
            }
            Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host " [STOPPED]" -ForegroundColor Green
        } catch {
            Write-Host " [ERROR: $_]" -ForegroundColor Red
        }
    } else {
        Write-Host "  - [SAFETY REFUSAL] PID $ProcessId ($($proc.Name)) does not match CampaignEcho $RoleName pattern ('$ExpectedPattern')." -ForegroundColor Yellow
        Write-Host "    Actual Command: $cmdLine" -ForegroundColor DarkGray
        Write-Host "    Process was NOT terminated to prevent terminating unrelated applications." -ForegroundColor Yellow
    }
}

# 1. Stop Backend Process
Write-Host "`n[1/2] Inspecting Backend Process..."
$backendPid = 0
if ($ownership -and $ownership.backend -and $ownership.backend.pid) {
    $backendPid = [int]$ownership.backend.pid
} elseif (Test-Path "$PSScriptRoot\backend.pid") {
    $rawPid = (Get-Content "$PSScriptRoot\backend.pid" -ErrorAction SilentlyContinue).Trim()
    if ($rawPid -match '^\d+$') { $backendPid = [int]$rawPid }
}

if ($backendPid -gt 0) {
    Stop-VerifiedProcess -ProcessId $backendPid -ExpectedPattern "uvicorn|backend\.app\.main|CampaignEcho" -RoleName "Backend"
}

# Check port 8000 listener for lingering CampaignEcho process
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($port8000) {
    $p8000Pid = $port8000[0].OwningProcess
    if ($p8000Pid -ne $backendPid) {
        Stop-VerifiedProcess -ProcessId $p8000Pid -ExpectedPattern "uvicorn|backend\.app\.main|CampaignEcho" -RoleName "Lingering Backend Port 8000"
    }
}

# 2. Stop Frontend Process
Write-Host "`n[2/2] Inspecting Frontend Process..."
$frontendPid = 0
if ($ownership -and $ownership.frontend -and $ownership.frontend.pid) {
    $frontendPid = [int]$ownership.frontend.pid
} elseif (Test-Path "$PSScriptRoot\frontend.pid") {
    $rawPid = (Get-Content "$PSScriptRoot\frontend.pid" -ErrorAction SilentlyContinue).Trim()
    if ($rawPid -match '^\d+$') { $frontendPid = [int]$rawPid }
}

if ($frontendPid -gt 0) {
    Stop-VerifiedProcess -ProcessId $frontendPid -ExpectedPattern "next|node|frontend|cmd\.exe" -RoleName "Frontend"
}

# Also stop parent cmd if tracked
if ($ownership -and $ownership.frontend -and $ownership.frontend.parent_pid) {
    $parentPid = [int]$ownership.frontend.parent_pid
    if ($parentPid -gt 0 -and $parentPid -ne $frontendPid) {
        Stop-VerifiedProcess -ProcessId $parentPid -ExpectedPattern "cmd\.exe|npm" -RoleName "Frontend Parent"
    }
}

# Check port 3000 listener for lingering CampaignEcho process
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    $p3000Pid = $port3000[0].OwningProcess
    if ($p3000Pid -ne $frontendPid) {
        Stop-VerifiedProcess -ProcessId $p3000Pid -ExpectedPattern "next|node|frontend|CampaignEcho" -RoleName "Lingering Frontend Port 3000"
    }
}

# 3. Clean up PID metadata only after stopping
Remove-Item "$PSScriptRoot\backend.pid" -Force -ErrorAction SilentlyContinue
Remove-Item "$PSScriptRoot\frontend.pid" -Force -ErrorAction SilentlyContinue
Remove-Item "$ownershipFile" -Force -ErrorAction SilentlyContinue

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Safe Shutdown Completed" -ForegroundColor Green
Write-Host "==========================================================`n" -ForegroundColor Green

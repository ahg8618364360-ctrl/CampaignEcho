# CampaignEcho — Automated Demonstration Safe Shutdown Script
# Verifies strict process ownership, project root, and launch credentials before terminating.
# Refuses to terminate unverified processes and preserves metadata on refusal.

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
$normalizedRoot = $rootPath.Replace('/', '\').TrimEnd('\')

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Stopping CampaignEcho Demonstration Services Safely" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ownershipFile = "$PSScriptRoot\demo-ownership.json"
$ownership = $null
if (Test-Path $ownershipFile) {
    try {
        $ownership = Get-Content $ownershipFile -Raw | ConvertFrom-Json
    } catch {
        Write-Host "  [WARN] demo-ownership.json is corrupted or unreadable." -ForegroundColor Yellow
    }
}

$hadSafetyRefusal = $false
$allShutdownSuccess = $true

function Test-ProcessStrictOwnership {
    param(
        [object]$Proc,
        [string]$Role,
        [string]$ExpectedToken
    )

    if (-not $Proc) { return $false }
    $cmd = $Proc.CommandLine
    if ([string]::IsNullOrWhiteSpace($cmd)) { return $false }

    $normCmd = $cmd.Replace('/', '\')

    # 1. Project Root Check: Command line MUST reference our specific project root
    if (-not $normCmd.Contains($normalizedRoot)) {
        return $false
    }

    # 2. Role-specific validation
    if ($Role -eq "Backend") {
        # Must be python or uvicorn
        if ($Proc.Name -notmatch '^(python|uvicorn)\.exe$') { return $false }
        # Must reference backend.app.main:app
        if ($cmd -notmatch 'backend\.app\.main:app') { return $false }
        # If token was recorded, verify token presence
        if (-not [string]::IsNullOrWhiteSpace($ExpectedToken)) {
            if (-not $cmd.Contains($ExpectedToken)) { return $false }
        }
        return $true
    } elseif ($Role -eq "Frontend") {
        # Must be node.exe (or next)
        if ($Proc.Name -notmatch '^(node|next)\.exe$') { return $false }
        # Must reference frontend directory
        if (-not $normCmd.Contains("$normalizedRoot\frontend")) { return $false }
        return $true
    }

    return $false
}

function Stop-StrictVerifiedProcess {
    param(
        [int]$ProcessId,
        [string]$Role,
        [string]$ExpectedToken
    )

    if ($ProcessId -le 0) { return }

    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "  - $Role (PID $ProcessId): [ALREADY STOPPED / STALE PID]" -ForegroundColor Gray
        return
    }

    $isOwned = Test-ProcessStrictOwnership -Proc $proc -Role $Role -ExpectedToken $ExpectedToken

    if ($isOwned) {
        Write-Host "  - $Role (PID $ProcessId; verified '$($proc.Name)'): Terminating..." -NoNewline
        try {
            # Stop any child processes that also match project root
            $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue
            foreach ($child in $children) {
                if ($child.CommandLine -and $child.CommandLine.Replace('/','\').Contains($normalizedRoot)) {
                    Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
                }
            }
            Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
            
            # Verify termination within 5 seconds
            $stopped = $false
            for ($k = 0; $k -lt 5; $k++) {
                Start-Sleep -Milliseconds 500
                $checkProc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
                if (-not $checkProc) {
                    $stopped = $true
                    break
                }
            }
            if ($stopped) {
                Write-Host " [STOPPED]" -ForegroundColor Green
            } else {
                Write-Host " [FAILED TO TERMINATE]" -ForegroundColor Red
                $script:allShutdownSuccess = $false
            }
        } catch {
            Write-Host " [ERROR: $_]" -ForegroundColor Red
            $script:allShutdownSuccess = $false
        }
    } else {
        Write-Host "`n  - [SAFETY REFUSAL] PID $ProcessId ($($proc.Name)) failed strict ownership verification for $Role." -ForegroundColor Yellow
        Write-Host "    Expected Project Root : $normalizedRoot" -ForegroundColor DarkGray
        Write-Host "    Actual Command Line   : $($proc.CommandLine)" -ForegroundColor DarkGray
        Write-Host "    Process was NOT terminated to protect external applications." -ForegroundColor Yellow
        $script:hadSafetyRefusal = $true
        $script:allShutdownSuccess = $false
    }
}

# 1. Stop Backend Process
Write-Host "`n[1/2] Inspecting Backend Process..."
$backendPid = 0
$backendToken = ""
if ($ownership -and $ownership.backend -and $ownership.backend.pid) {
    $backendPid = [int]$ownership.backend.pid
    $backendToken = [string]$ownership.backend.launch_token
} elseif (Test-Path "$PSScriptRoot\backend.pid") {
    $rawPid = (Get-Content "$PSScriptRoot\backend.pid" -ErrorAction SilentlyContinue).Trim()
    if ($rawPid -match '^\d+$') { $backendPid = [int]$rawPid }
}

if ($backendPid -gt 0) {
    Stop-StrictVerifiedProcess -ProcessId $backendPid -Role "Backend" -ExpectedToken $backendToken
}

# Check port 8000 listener
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($port8000) {
    $p8000Pid = $port8000[0].OwningProcess
    if ($p8000Pid -ne $backendPid) {
        Write-Host "  - Port 8000 has listener PID $p8000Pid. Verifying ownership..."
        Stop-StrictVerifiedProcess -ProcessId $p8000Pid -Role "Backend" -ExpectedToken $backendToken
    }
}

# 2. Stop Frontend Process
Write-Host "`n[2/2] Inspecting Frontend Process..."
$frontendPid = 0
$frontendToken = ""
if ($ownership -and $ownership.frontend -and $ownership.frontend.pid) {
    $frontendPid = [int]$ownership.frontend.pid
    $frontendToken = [string]$ownership.frontend.launch_token
} elseif (Test-Path "$PSScriptRoot\frontend.pid") {
    $rawPid = (Get-Content "$PSScriptRoot\frontend.pid" -ErrorAction SilentlyContinue).Trim()
    if ($rawPid -match '^\d+$') { $frontendPid = [int]$rawPid }
}

if ($frontendPid -gt 0) {
    Stop-StrictVerifiedProcess -ProcessId $frontendPid -Role "Frontend" -ExpectedToken $frontendToken
}

# Check port 3000 listener
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    $p3000Pid = $port3000[0].OwningProcess
    if ($p3000Pid -ne $frontendPid) {
        Write-Host "  - Port 3000 has listener PID $p3000Pid. Verifying ownership..."
        Stop-StrictVerifiedProcess -ProcessId $p3000Pid -Role "Frontend" -ExpectedToken $frontendToken
    }
}

# Verify Port Release
Start-Sleep -Seconds 1
$p8000Check = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$p3000Check = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($p8000Check -or $p3000Check) {
    if ($p8000Check) { Write-Host "  - [WARN] Port 8000 is still listening (PID $($p8000Check[0].OwningProcess))." -ForegroundColor Yellow }
    if ($p3000Check) { Write-Host "  - [WARN] Port 3000 is still listening (PID $($p3000Check[0].OwningProcess))." -ForegroundColor Yellow }
}

# 3. Clean up PID metadata ONLY if shutdown succeeded without safety refusal
if (-not $hadSafetyRefusal -and $allShutdownSuccess -and -not $p8000Check -and -not $p3000Check) {
    Remove-Item "$PSScriptRoot\backend.pid" -Force -ErrorAction SilentlyContinue
    Remove-Item "$PSScriptRoot\frontend.pid" -Force -ErrorAction SilentlyContinue
    Remove-Item "$ownershipFile" -Force -ErrorAction SilentlyContinue
    Write-Host "`n  - Ownership tracking files safely cleaned up." -ForegroundColor Gray
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  Safe Shutdown Completed (Exit Code 0)" -ForegroundColor Green
    Write-Host "==========================================================`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n  [CRITICAL] Safety refusal occurred or ports remain occupied." -ForegroundColor Yellow
    Write-Host "  Ownership metadata PRESERVED at $ownershipFile for investigation." -ForegroundColor Yellow
    Write-Host "`n==========================================================" -ForegroundColor Yellow
    Write-Host "  Safe Shutdown Ended with Incomplete Cleanup (Exit Code 1)" -ForegroundColor Yellow
    Write-Host "==========================================================`n" -ForegroundColor Yellow
    exit 1
}

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$env:NODE_PATH = "$root\frontend\node_modules"

Write-Host "=== 1. Starting Demo Server ==="
& "$PSScriptRoot\start-demo.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start demo server."
    exit 1
}

$uatPassed = $false
try {
    Write-Host "`n=== 2. Running Playwright UAT Suite ==="
    & node "$PSScriptRoot\run_uat_journey.js"
    $uatExit = $LASTEXITCODE
    if ($uatExit -eq 0) {
        $uatPassed = $true
        Write-Host "Playwright UAT execution succeeded." -ForegroundColor Green
    } else {
        Write-Host "Playwright UAT execution reported failures (code: $uatExit)." -ForegroundColor Red
    }
} finally {
    Write-Host "`n=== 3. Stopping Demo Server ==="
    & "$PSScriptRoot\stop-demo.ps1"
    $stopExit = $LASTEXITCODE
    Write-Host "Stop-demo completed with code: $stopExit."

    Write-Host "`n=== 4. Cleaning Disposable UAT Test Records ==="
    & "$root\venv\Scripts\python.exe" "$PSScriptRoot\cleanup_uat.py"
}

if ($uatPassed -and ($stopExit -eq 0)) {
    Write-Host "`n=== ALL UAT CHECKS AND CLEANUP PASSED (100% GREEN) ===" -ForegroundColor Green
    exit 0
} else {
    Write-Error "Integrated UAT run failed."
    exit 1
}

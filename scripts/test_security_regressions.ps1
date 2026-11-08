# CampaignEcho — Security & Process Ownership Automated Regression Test Suite
# Tests:
# 1. Placeholder API keys rejection (Hindsight & Z.ai)
# 2. Missing database tables detection (8/8 schema enforcement)
# 3. Authentic brand collision refusal in seeder
# 4. Stale PID graceful handling in stop-demo.ps1
# 5. Corrupted ownership metadata graceful handling in stop-demo.ps1
# 6. Safety refusal for unrelated/misleading processes (refuses to terminate)
# 7. Metadata preservation on shutdown safety refusal
# 8. Unrelated listener on port 8000 adoption refusal in start-demo.ps1
# 9. Unrelated listener on port 3000 adoption refusal in start-demo.ps1
# 10. Strict Frontend token verification & safety refusal in stop-demo.ps1
# 11. Startup rollback verification when frontend fails

$ErrorActionPreference = "Continue"
$rootPath = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $rootPath

$pythonExe = "$rootPath\venv\Scripts\python.exe"
$ownershipFile = "$PSScriptRoot\demo-ownership.json"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Running CampaignEcho Security & Ownership Regression Tests" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$testResults = @()

function Report-Test {
    param([string]$TestName, [bool]$Passed, [string]$Details)
    $status = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }
    Write-Host "  $status $TestName : $Details" -ForegroundColor $color
    $script:testResults += [PSCustomObject]@{
        Name = $TestName
        Passed = $Passed
        Details = $Details
    }
}

# --- TEST 1: Placeholder Hindsight API Key Rejection ---
Write-Host "`n[Test 1] Testing rejection of placeholder HINDSIGHT_API_KEY..."
$env:HINDSIGHT_API_KEY = "your_hindsight_api_key_here"
$t1Output = & $pythonExe "$rootPath\scripts\verify_readiness.py" 2>&1
$t1Exit = $LASTEXITCODE
$t1Passed = ($t1Exit -eq 1) -and ($t1Output -match "placeholder value")
Report-Test -TestName "Placeholder Hindsight Key Rejection" -Passed $t1Passed -Details "Exit Code: $t1Exit"
$env:HINDSIGHT_API_KEY = $null

# --- TEST 2: Placeholder Z.ai API Key Rejection ---
Write-Host "`n[Test 2] Testing rejection of placeholder ZAI_API_KEY..."
$env:ZAI_API_KEY = "sk-placeholder-demo-key"
$t2Output = & $pythonExe "$rootPath\scripts\verify_readiness.py" 2>&1
$t2Exit = $LASTEXITCODE
$t2Passed = ($t2Exit -eq 1) -and ($t2Output -match "placeholder value")
Report-Test -TestName "Placeholder Z.ai Key Rejection" -Passed $t2Passed -Details "Exit Code: $t2Exit"
$env:ZAI_API_KEY = $null

# --- TEST 3: Missing Database Tables Detection ---
Write-Host "`n[Test 3] Testing detection of missing database tables..."
$tempEmptyDb = "$rootPath\temp_empty_test.db"
if (Test-Path $tempEmptyDb) { Remove-Item $tempEmptyDb -Force }
$env:DATABASE_URL = "sqlite:///$tempEmptyDb"
$t3Output = & $pythonExe "$rootPath\scripts\verify_readiness.py" 2>&1
$t3Exit = $LASTEXITCODE
$t3Passed = ($t3Exit -eq 1) -and ($t3Output -match "Missing required database tables")
Report-Test -TestName "Missing Database Tables Detection" -Passed $t3Passed -Details "Exit Code: $t3Exit"
$env:DATABASE_URL = $null
if (Test-Path $tempEmptyDb) { Remove-Item $tempEmptyDb -Force -ErrorAction SilentlyContinue }

# --- TEST 4: Authentic Brand Collision Refusal in Seeder ---
Write-Host "`n[Test 4] Testing seeder refusal when authentic brand exists..."
$t4Output = & $pythonExe -m pytest "$rootPath\backend\tests\test_seed_demo.py" -k "test_seed_demo_refuses_non_synthetic_brand_collision" 2>&1
$t4Exit = $LASTEXITCODE
$t4Passed = ($t4Exit -eq 0) -and ($t4Output -match "PASSED")
Report-Test -TestName "Authentic Brand Collision Refusal" -Passed $t4Passed -Details "Exit Code: $t4Exit"

# --- TEST 5: Stale PID Handling in stop-demo.ps1 ---
Write-Host "`n[Test 5] Testing graceful handling of stale PID..."
# Create a dummy ownership file with non-existent PID
@{
    version = "2.0"
    project_root = $rootPath
    launch_token = "stale-test-token"
    backend = @{ pid = 999999; port = 8000; launch_token = "stale-test-token" }
    frontend = @{ pid = 999998; port = 3000; launch_token = "stale-test-token" }
} | ConvertTo-Json -Depth 4 | Out-File $ownershipFile -Encoding ascii

$t5Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\stop-demo.ps1" 2>&1
$t5Exit = $LASTEXITCODE
$t5Passed = ($t5Output -match "ALREADY STOPPED / STALE PID") -and ($t5Exit -eq 0)
Report-Test -TestName "Stale PID Graceful Handling" -Passed $t5Passed -Details "Exit Code: $t5Exit"

# --- TEST 6: Corrupted Ownership Metadata Handling ---
Write-Host "`n[Test 6] Testing corrupted ownership metadata handling..."
"{ invalid json content" | Out-File $ownershipFile -Encoding ascii
$t6Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\stop-demo.ps1" 2>&1
$t6Exit = $LASTEXITCODE
$t6Passed = [bool]($t6Output -match "demo-ownership.json is corrupted")
Report-Test -TestName "Corrupted Ownership Handling" -Passed $t6Passed -Details "Corruption handled cleanly"
Remove-Item $ownershipFile -Force -ErrorAction SilentlyContinue

# --- TEST 7: Safety Refusal & Metadata Preservation for Unrelated Process ---
Write-Host "`n[Test 7] Testing safety refusal and metadata preservation for unrelated process..."
# Launch an innocent background sleep process that has nothing to do with CampaignEcho
$dummyProc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-Command", "Start-Sleep -Seconds 45" -PassThru -WindowStyle Hidden
$dummyPid = $dummyProc.Id

try {
    # Point ownership to this dummy process
    @{
        version = "2.0"
        project_root = $rootPath
        launch_token = "security-test-token"
        backend = @{
            pid = $dummyPid
            port = 8000
            launch_token = "security-test-token"
        }
    } | ConvertTo-Json -Depth 4 | Out-File $ownershipFile -Encoding ascii

    # Run stop-demo.ps1 - it MUST refuse to kill this process because its command line does not match CampaignEcho!
    $t7Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\stop-demo.ps1" 2>&1
    $t7Exit = $LASTEXITCODE

    # Verify dummy process is STILL ALIVE
    $procStillAlive = (Get-Process -Id $dummyPid -ErrorAction SilentlyContinue) -ne $null
    # Verify ownership file was PRESERVED
    $metaPreserved = Test-Path $ownershipFile

    $t7Passed = ($t7Output -match "SAFETY REFUSAL") -and $procStillAlive -and $metaPreserved -and ($t7Exit -eq 1)
    Report-Test -TestName "Safety Refusal & Metadata Preservation" -Passed $t7Passed -Details "Refusal triggered=$($t7Output -match 'SAFETY REFUSAL'); Process alive=$procStillAlive; Meta preserved=$metaPreserved"
} finally {
    # Clean up dummy process safely
    Stop-Process -Id $dummyPid -Force -ErrorAction SilentlyContinue
    Remove-Item $ownershipFile -Force -ErrorAction SilentlyContinue
}

# --- TEST 8: Adoption Refusal on Port 8000 in start-demo.ps1 ---
Write-Host "`n[Test 8] Testing adoption refusal when port 8000 has an unrelated listener..."
# Spawn a python HTTP server on port 8000
$port8000Dummy = Start-Process -FilePath $pythonExe -ArgumentList "-m", "http.server", "8000" -PassThru -WindowStyle Hidden
$p8000Pid = $port8000Dummy.Id

try {
    # Wait for port 8000 to listen
    Start-Sleep -Seconds 2
    
    # Run start-demo.ps1 - it MUST refuse to adopt this foreign http.server process and abort!
    $t8Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\start-demo.ps1" 2>&1
    $t8Exit = $LASTEXITCODE

    $refusedAdoption = ($t8Output -match "Port 8000 is occupied by an unverified process") -or ($t8Output -match "Refusing to adopt")
    $dummyStillAlive = (Get-Process -Id $p8000Pid -ErrorAction SilentlyContinue) -ne $null
    
    $t8Passed = $refusedAdoption -and $dummyStillAlive -and ($t8Exit -eq 1)
    Report-Test -TestName "Unrelated Port 8000 Listener Adoption Refusal" -Passed $t8Passed -Details "Adoption refused=$refusedAdoption; Dummy alive=$dummyStillAlive; Exit Code=$t8Exit"
} finally {
    Stop-Process -Id $p8000Pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# --- TEST 9: Adoption Refusal on Port 3000 in start-demo.ps1 ---
Write-Host "`n[Test 9] Testing adoption refusal when port 3000 has an unrelated listener..."
$port3000Dummy = Start-Process -FilePath $pythonExe -ArgumentList "-m", "http.server", "3000" -PassThru -WindowStyle Hidden
$p3000Pid = $port3000Dummy.Id

try {
    Start-Sleep -Seconds 2
    $t9Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\start-demo.ps1" 2>&1
    $t9Exit = $LASTEXITCODE

    $refused3000 = ($t9Output -match "Port 3000 is occupied by an unverified process") -or ($t9Output -match "Refusing to adopt")
    $dummy3000Alive = (Get-Process -Id $p3000Pid -ErrorAction SilentlyContinue) -ne $null

    $t9Passed = $refused3000 -and $dummy3000Alive -and ($t9Exit -eq 1)
    Report-Test -TestName "Unrelated Port 3000 Listener Adoption Refusal" -Passed $t9Passed -Details "Adoption refused=$refused3000; Dummy alive=$dummy3000Alive; Exit Code=$t9Exit"
} finally {
    Stop-Process -Id $p3000Pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# --- TEST 10: Strict Frontend Token Verification & Safety Refusal in stop-demo.ps1 ---
Write-Host "`n[Test 10] Testing strict Frontend token verification & safety refusal in stop-demo.ps1..."
$dummyNodeProc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-Command", "Start-Sleep -Seconds 45" -PassThru -WindowStyle Hidden
$dummyNodePid = $dummyNodeProc.Id

try {
    @{
        version = "2.0"
        project_root = $rootPath
        launch_token = "token-frontend-alpha"
        frontend = @{
            pid = $dummyNodePid
            port = 3000
            launch_token = "token-frontend-alpha"
        }
    } | ConvertTo-Json -Depth 4 | Out-File $ownershipFile -Encoding ascii

    $t10Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\stop-demo.ps1" 2>&1
    $t10Exit = $LASTEXITCODE

    $procStillAlive = (Get-Process -Id $dummyNodePid -ErrorAction SilentlyContinue) -ne $null
    $metaPreserved = Test-Path $ownershipFile

    $t10Passed = ($t10Output -match "SAFETY REFUSAL") -and $procStillAlive -and $metaPreserved -and ($t10Exit -eq 1)
    Report-Test -TestName "Strict Frontend Token Verification & Safety Refusal" -Passed $t10Passed -Details "Safety refusal triggered=$($t10Output -match 'SAFETY REFUSAL'); Process alive=$procStillAlive; Meta preserved=$metaPreserved"
} finally {
    Stop-Process -Id $dummyNodePid -Force -ErrorAction SilentlyContinue
    Remove-Item $ownershipFile -Force -ErrorAction SilentlyContinue
}

# --- TEST 11: Startup Rollback Verification ---
Write-Host "`n[Test 11] Testing backend rollback when frontend fails during startup..."
# Occupy port 3000 with a foreign server to trigger frontend startup abort
$blocker3000 = Start-Process -FilePath $pythonExe -ArgumentList "-m", "http.server", "3000" -PassThru -WindowStyle Hidden
$blockerPid = $blocker3000.Id

try {
    Start-Sleep -Seconds 2
    # Ensure port 8000 is clean
    $p8000Initial = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($p8000Initial) {
        Stop-Process -Id $p8000Initial[0].OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }

    $t11Output = & powershell.exe -ExecutionPolicy Bypass -File "$rootPath\scripts\start-demo.ps1" 2>&1
    $t11Exit = $LASTEXITCODE

    # Check if rollback message appeared
    $rollbackTriggered = ($t11Output -match "Rolling back newly launched backend process")
    # Verify port 8000 is NOT listening (backend rolled back)
    Start-Sleep -Seconds 1
    $p8000After = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    $backendRolledBack = (-not $p8000After)
    $pidCleaned = (-not (Test-Path "$PSScriptRoot\backend.pid"))

    $t11Passed = $rollbackTriggered -and $backendRolledBack -and ($t11Exit -eq 1)
    Report-Test -TestName "Startup Rollback Verification" -Passed $t11Passed -Details "Rollback triggered=$rollbackTriggered; Port 8000 clean=$backendRolledBack; Exit Code=$t11Exit"
} finally {
    Stop-Process -Id $blockerPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# --- SUMMARY REPORT ---
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Security & Ownership Regression Test Summary" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$failedTests = $testResults | Where-Object { -not $_.Passed }
if ($failedTests.Count -eq 0) {
    Write-Host "  ALL $($testResults.Count)/$($testResults.Count) SECURITY REGRESSION TESTS PASSED." -ForegroundColor Green
    Write-Host "==========================================================`n" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  FAILURES DETECTED: $($failedTests.Count)/$($testResults.Count) tests failed." -ForegroundColor Red
    foreach ($f in $failedTests) {
        Write-Host "    - $($f.Name): $($f.Details)" -ForegroundColor Red
    }
    Write-Host "==========================================================`n" -ForegroundColor Cyan
    exit 1
}

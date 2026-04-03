# Railway 交互式修复工具

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  Railway Backend Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=" * 61 -ForegroundColor Cyan
Write-Host ""

# Test current status
Write-Host "[1/6] Testing current backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health" -TimeoutSec 10
    Write-Host "      Status: OK - Backend is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Great news! Your backend is already working." -ForegroundColor Green
    Write-Host "You can start testing your website now." -ForegroundColor Green
    Write-Host ""
    $open = Read-Host "Open website in browser? (y/n)"
    if ($open -eq "y") {
        Start-Process "https://www.elemental.bond"
    }
    exit 0
} catch {
    Write-Host "      Status: FAILED (404)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/6] Opening Railway dashboard..." -ForegroundColor Yellow
Start-Process "https://railway.app/dashboard"
Write-Host "      Railway dashboard opened in browser" -ForegroundColor Gray

Write-Host ""
Write-Host "[3/6] Checking what to look for..." -ForegroundColor Yellow
Write-Host ""
Write-Host "In the Railway dashboard, please check:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Find your backend project" -ForegroundColor White
Write-Host "  2. Click on 'Settings'" -ForegroundColor White
Write-Host "  3. Look for 'Root Directory'" -ForegroundColor White
Write-Host ""

Write-Host "[4/6] Root Directory Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "The Root Directory should be set to: " -NoNewline -ForegroundColor White
Write-Host "backend" -ForegroundColor Green
Write-Host ""
$rootDirCorrect = Read-Host "Is the Root Directory set to 'backend'? (y/n)"

if ($rootDirCorrect -ne "y") {
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "1. In Railway Settings, find 'Root Directory'" -ForegroundColor Yellow
    Write-Host "2. Set it to: backend" -ForegroundColor Green
    Write-Host "3. Click 'Save'" -ForegroundColor Yellow
    Write-Host "4. Wait for automatic redeployment (3-5 minutes)" -ForegroundColor Yellow
    Write-Host ""
    $fixed = Read-Host "Have you set the Root Directory to 'backend'? (y/n)"
    
    if ($fixed -eq "y") {
        Write-Host ""
        Write-Host "Great! Waiting 5 minutes for redeployment..." -ForegroundColor Cyan
        Start-Sleep -Seconds 300
        
        Write-Host ""
        Write-Host "Testing backend again..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health" -TimeoutSec 10
            Write-Host "SUCCESS! Backend is now working!" -ForegroundColor Green
            Write-Host ""
            $open = Read-Host "Open website in browser? (y/n)"
            if ($open -eq "y") {
                Start-Process "https://www.elemental.bond"
            }
            exit 0
        } catch {
            Write-Host "Still not working. Let's check more settings..." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "[5/6] Start Command Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "The Start Command should be: " -NoNewline -ForegroundColor White
Write-Host "python run.py" -ForegroundColor Green
Write-Host ""
$startCmdCorrect = Read-Host "Is the Start Command set to 'python run.py'? (y/n)"

if ($startCmdCorrect -ne "y") {
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "1. In Railway Settings, find 'Start Command'" -ForegroundColor Yellow
    Write-Host "2. Set it to: python run.py" -ForegroundColor Green
    Write-Host "3. Click 'Save'" -ForegroundColor Yellow
    Write-Host "4. Go to Deployments and click 'Redeploy'" -ForegroundColor Yellow
    Write-Host ""
    $fixed = Read-Host "Have you updated the Start Command and redeployed? (y/n)"
    
    if ($fixed -eq "y") {
        Write-Host ""
        Write-Host "Waiting 5 minutes for redeployment..." -ForegroundColor Cyan
        Start-Sleep -Seconds 300
        
        Write-Host ""
        Write-Host "Testing backend again..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health" -TimeoutSec 10
            Write-Host "SUCCESS! Backend is now working!" -ForegroundColor Green
            Write-Host ""
            $open = Read-Host "Open website in browser? (y/n)"
            if ($open -eq "y") {
                Start-Process "https://www.elemental.bond"
            }
            exit 0
        } catch {
            Write-Host "Still not working. Let's check the logs..." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "[6/6] Check Deployment Logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please check the logs in Railway:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to 'Deployments' tab" -ForegroundColor White
Write-Host "2. Click on the latest deployment" -ForegroundColor White
Write-Host "3. Check 'Build Logs' for errors" -ForegroundColor White
Write-Host "4. Check 'Deploy Logs' for errors" -ForegroundColor White
Write-Host ""
Write-Host "Look for:" -ForegroundColor Cyan
Write-Host "  - 'Successfully installed' messages (good)" -ForegroundColor Green
Write-Host "  - 'Running on http://0.0.0.0:xxxx' (good)" -ForegroundColor Green
Write-Host "  - 'ERROR' or 'FAILED' messages (bad)" -ForegroundColor Red
Write-Host "  - Python errors like ModuleNotFoundError (bad)" -ForegroundColor Red
Write-Host ""

$logsOk = Read-Host "Do the logs show any errors? (y/n)"

if ($logsOk -eq "y") {
    Write-Host ""
    Write-Host "Please share the error message for further diagnosis." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Cyan
    Write-Host "  - Missing dependencies: Check requirements.txt" -ForegroundColor White
    Write-Host "  - Python version: May need runtime.txt" -ForegroundColor White
    Write-Host "  - Environment variables: Check Variables tab" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed help, see:" -ForegroundColor Cyan
    Write-Host "  - diagnose-railway.md" -ForegroundColor White
    Write-Host "  - RAILWAY_CHECKLIST.md" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "If logs look good but backend still doesn't work:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Try manual redeploy in Railway" -ForegroundColor White
    Write-Host "2. Wait 5 minutes and test again" -ForegroundColor White
    Write-Host "3. Check Railway status: https://railway.app/status" -ForegroundColor White
    Write-Host ""
    
    $retry = Read-Host "Would you like to wait 5 minutes and test again? (y/n)"
    if ($retry -eq "y") {
        Write-Host ""
        Write-Host "Waiting 5 minutes..." -ForegroundColor Cyan
        Start-Sleep -Seconds 300
        
        Write-Host ""
        Write-Host "Testing backend..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health" -TimeoutSec 10
            Write-Host "SUCCESS! Backend is now working!" -ForegroundColor Green
            Write-Host ""
            $open = Read-Host "Open website in browser? (y/n)"
            if ($open -eq "y") {
                Start-Process "https://www.elemental.bond"
            }
            exit 0
        } catch {
            Write-Host "Still not working." -ForegroundColor Red
            Write-Host ""
            Write-Host "Please check Railway logs for specific errors." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=" * 61 -ForegroundColor Gray
Write-Host "For more help, see:" -ForegroundColor Cyan
Write-Host "  - RAILWAY_CHECKLIST.md (step-by-step checklist)" -ForegroundColor White
Write-Host "  - diagnose-railway.md (detailed diagnosis)" -ForegroundColor White
Write-Host "  - DEPLOYMENT_FIX.md (comprehensive fixes)" -ForegroundColor White
Write-Host "=" * 61 -ForegroundColor Gray

# 快速部署测试脚本

Write-Host "Testing deployment status..." -ForegroundColor Cyan
Write-Host ""

# Test backend
Write-Host "1. Testing backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health" -TimeoutSec 10
    Write-Host "   Backend OK: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   Backend FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test frontend
Write-Host "2. Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.elemental.bond" -TimeoutSec 10 -UseBasicParsing
    Write-Host "   Frontend OK: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Frontend FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check git status
Write-Host "3. Checking git status..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "   Uncommitted changes found" -ForegroundColor Yellow
} else {
    Write-Host "   Working directory clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green

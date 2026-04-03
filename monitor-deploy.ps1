# 自动化部署监控脚本
# 监控 Vercel 和 Railway 部署状态，直到成功

param(
    [int]$MaxWaitMinutes = 10,
    [int]$CheckIntervalSeconds = 15
)

$ErrorActionPreference = "Continue"

Write-Host "Starting deployment monitoring..." -ForegroundColor Cyan
Write-Host "Max wait time: $MaxWaitMinutes minutes" -ForegroundColor Gray
Write-Host "Check interval: $CheckIntervalSeconds seconds" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$maxWaitTime = $startTime.AddMinutes($MaxWaitMinutes)

$backendUrl = "https://deepseek-oracle-backend-production.up.railway.app/health"
$frontendUrl = "https://www.elemental.bond"

$backendOk = $false
$frontendOk = $false

while ((Get-Date) -lt $maxWaitTime) {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
    Write-Host "[$elapsed s] Checking deployment status..." -ForegroundColor Yellow
    
    # 检查后端
    if (-not $backendOk) {
        try {
            $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 10 -ErrorAction Stop
            if ($response.status -eq "ok") {
                Write-Host "  [OK] Backend deployed successfully!" -ForegroundColor Green
                $backendOk = $true
            }
        } catch {
            Write-Host "  [WAIT] Backend still deploying..." -ForegroundColor Gray
        }
    }
    
    # 检查前端
    if (-not $frontendOk) {
        try {
            $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "  [OK] Frontend deployed successfully!" -ForegroundColor Green
                $frontendOk = $true
            }
        } catch {
            Write-Host "  [WAIT] Frontend still deploying..." -ForegroundColor Gray
        }
    }
    
    # Check if both are successful
    if ($backendOk -and $frontendOk) {
        Write-Host ""
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now test the functionality:" -ForegroundColor Cyan
        Write-Host "  1. Visit: $frontendUrl" -ForegroundColor White
        Write-Host "  2. Enter birthday information" -ForegroundColor White
        Write-Host "  3. Check results and Email Gate" -ForegroundColor White
        Write-Host ""
        Write-Host "Or run quick test: .\quick-test.ps1" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Start-Sleep -Seconds $CheckIntervalSeconds
}

# Timeout
Write-Host ""
Write-Host "Deployment timeout ($MaxWaitMinutes minutes)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Current status:" -ForegroundColor Cyan
Write-Host "  Backend: $(if ($backendOk) { '[OK]' } else { '[FAIL]' })" -ForegroundColor $(if ($backendOk) { 'Green' } else { 'Red' })
Write-Host "  Frontend: $(if ($frontendOk) { '[OK]' } else { '[FAIL]' })" -ForegroundColor $(if ($frontendOk) { 'Green' } else { 'Red' })
Write-Host ""
Write-Host "Please check manually:" -ForegroundColor Yellow
Write-Host "  Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  Railway: https://railway.app/dashboard" -ForegroundColor White

exit 1

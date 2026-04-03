# 自动化部署监控脚本
# 监控 Vercel 和 Railway 部署状态，直到成功

param(
    [int]$MaxWaitMinutes = 10,
    [int]$CheckIntervalSeconds = 15
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 开始监控部署..." -ForegroundColor Cyan
Write-Host "最大等待时间: $MaxWaitMinutes 分钟" -ForegroundColor Gray
Write-Host "检查间隔: $CheckIntervalSeconds 秒" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$maxWaitTime = $startTime.AddMinutes($MaxWaitMinutes)

$backendUrl = "https://deepseek-oracle-backend-production.up.railway.app/health"
$frontendUrl = "https://www.elemental.bond"

$backendOk = $false
$frontendOk = $false

while ((Get-Date) -lt $maxWaitTime) {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
    Write-Host "[$elapsed 秒] 检查部署状态..." -ForegroundColor Yellow
    
    # 检查后端
    if (-not $backendOk) {
        try {
            $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 10 -ErrorAction Stop
            if ($response.status -eq "ok") {
                Write-Host "  ✅ 后端部署成功!" -ForegroundColor Green
                $backendOk = $true
            }
        } catch {
            Write-Host "  ⏳ 后端还在部署中..." -ForegroundColor Gray
        }
    }
    
    # 检查前端
    if (-not $frontendOk) {
        try {
            $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ 前端部署成功!" -ForegroundColor Green
                $frontendOk = $true
            }
        } catch {
            Write-Host "  ⏳ 前端还在部署中..." -ForegroundColor Gray
        }
    }
    
    # 如果都成功了，退出
    if ($backendOk -and $frontendOk) {
        Write-Host ""
        Write-Host "🎉 部署全部完成!" -ForegroundColor Green
        Write-Host ""
        Write-Host "现在可以测试功能了:" -ForegroundColor Cyan
        Write-Host "  1. 访问: $frontendUrl" -ForegroundColor White
        Write-Host "  2. 输入生日信息" -ForegroundColor White
        Write-Host "  3. 查看结果和 Email Gate" -ForegroundColor White
        Write-Host ""
        Write-Host "或运行快速测试: .\quick-test.ps1" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Start-Sleep -Seconds $CheckIntervalSeconds
}

# 超时
Write-Host ""
Write-Host "⚠️ 部署超时 ($MaxWaitMinutes 分钟)" -ForegroundColor Yellow
Write-Host ""
Write-Host "当前状态:" -ForegroundColor Cyan
Write-Host "  后端: $(if ($backendOk) { '✅ 成功' } else { '❌ 失败' })" -ForegroundColor $(if ($backendOk) { 'Green' } else { 'Red' })
Write-Host "  前端: $(if ($frontendOk) { '✅ 成功' } else { '❌ 失败' })" -ForegroundColor $(if ($frontendOk) { 'Green' } else { 'Red' })
Write-Host ""
Write-Host "请手动检查:" -ForegroundColor Yellow
Write-Host "  Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  Railway: https://railway.app/dashboard" -ForegroundColor White

exit 1

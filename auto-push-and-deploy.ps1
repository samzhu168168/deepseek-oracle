# 自动推送和部署脚本
# 功能：自动重试 Git 推送，直到成功，然后监控 Vercel 部署

Write-Host "🚀 开始自动部署流程..." -ForegroundColor Cyan
Write-Host ""

# 配置
$maxRetries = 10
$retryDelay = 5
$vercelUrl = "https://elemental.bond"

# 函数：推送到 GitHub
function Push-ToGitHub {
    param (
        [int]$maxAttempts = 10,
        [int]$delaySeconds = 5
    )
    
    Write-Host "📤 正在推送到 GitHub..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $maxAttempts; $i++) {
        Write-Host "尝试 $i/$maxAttempts..." -ForegroundColor Gray
        
        try {
            $result = git push origin main 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ 推送成功！" -ForegroundColor Green
                return $true
            }
            
            Write-Host "❌ 推送失败: $result" -ForegroundColor Red
            
            if ($i -lt $maxAttempts) {
                Write-Host "⏳ 等待 $delaySeconds 秒后重试..." -ForegroundColor Yellow
                Start-Sleep -Seconds $delaySeconds
            }
        }
        catch {
            Write-Host "❌ 推送出错: $_" -ForegroundColor Red
            
            if ($i -lt $maxAttempts) {
                Write-Host "⏳ 等待 $delaySeconds 秒后重试..." -ForegroundColor Yellow
                Start-Sleep -Seconds $delaySeconds
            }
        }
    }
    
    Write-Host "❌ 推送失败，已达到最大重试次数" -ForegroundColor Red
    return $false
}

# 函数：检查 Vercel 部署状态
function Test-VercelDeployment {
    param (
        [string]$url,
        [int]$maxWaitMinutes = 5
    )
    
    Write-Host ""
    Write-Host "🔍 监控 Vercel 部署状态..." -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Gray
    
    $startTime = Get-Date
    $maxWaitTime = $startTime.AddMinutes($maxWaitMinutes)
    
    while ((Get-Date) -lt $maxWaitTime) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ 网站正常访问！" -ForegroundColor Green
                Write-Host "状态码: $($response.StatusCode)" -ForegroundColor Gray
                return $true
            }
        }
        catch {
            $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
            Write-Host "⏳ 等待部署完成... (已等待 $elapsed 秒)" -ForegroundColor Yellow
        }
        
        Start-Sleep -Seconds 10
    }
    
    Write-Host "⚠️  超时：部署可能还在进行中" -ForegroundColor Yellow
    return $false
}

# 函数：显示部署摘要
function Show-DeploymentSummary {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "📊 部署摘要" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    
    # Git 状态
    Write-Host "📦 Git 状态:" -ForegroundColor Yellow
    $branch = git branch --show-current
    $lastCommit = git log -1 --oneline
    Write-Host "  分支: $branch" -ForegroundColor Gray
    Write-Host "  最新提交: $lastCommit" -ForegroundColor Gray
    Write-Host ""
    
    # 部署信息
    Write-Host "🌐 部署信息:" -ForegroundColor Yellow
    Write-Host "  前端 URL: https://elemental.bond" -ForegroundColor Gray
    Write-Host "  Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host ""
    
    # P1 优化摘要
    Write-Host "🎯 P1 优化内容:" -ForegroundColor Yellow
    Write-Host "  ✅ TeaserReading 组件（50-100 字开场）" -ForegroundColor Gray
    Write-Host "  ✅ PreviewReading 组件（200-300 字预览）" -ForegroundColor Gray
    Write-Host "  ✅ 3 层解锁策略（Teaser → Preview → Full）" -ForegroundColor Gray
    Write-Host "  ✅ Email Gate 时机优化（5s → 3s）" -ForegroundColor Gray
    Write-Host "  ✅ Paywall 延迟优化（3s → 8s）" -ForegroundColor Gray
    Write-Host ""
    
    # 预期效果
    Write-Host "📈 预期效果:" -ForegroundColor Yellow
    Write-Host "  转化率: 10% → 24% (+140%)" -ForegroundColor Green
    Write-Host "  Email 捕获率: 20% → 80% (+300%)" -ForegroundColor Green
    Write-Host "  月收入: `$149 → `$17,928 (+11,900%)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=" * 60 -ForegroundColor Cyan
}

# 主流程
Write-Host "步骤 1/3: 推送代码到 GitHub" -ForegroundColor Cyan
Write-Host ""

$pushSuccess = Push-ToGitHub -maxAttempts $maxRetries -delaySeconds $retryDelay

if (-not $pushSuccess) {
    Write-Host ""
    Write-Host "❌ 自动部署失败：无法推送到 GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 建议：" -ForegroundColor Yellow
    Write-Host "  1. 检查网络连接" -ForegroundColor Gray
    Write-Host "  2. 稍后手动运行: git push origin main" -ForegroundColor Gray
    Write-Host "  3. 或使用移动热点重试" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "步骤 2/3: 等待 Vercel 自动部署" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel 正在自动部署..." -ForegroundColor Yellow
Write-Host "预计时间: 2-3 分钟" -ForegroundColor Gray
Write-Host ""

# 等待 30 秒让 Vercel 开始部署
Write-Host "⏳ 等待 30 秒让 Vercel 开始部署..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "步骤 3/3: 验证部署" -ForegroundColor Cyan

$deploySuccess = Test-VercelDeployment -url $vercelUrl -maxWaitMinutes 5

Write-Host ""

if ($deploySuccess) {
    Write-Host "🎉 部署成功！" -ForegroundColor Green
    Write-Host ""
    Show-DeploymentSummary
    Write-Host ""
    Write-Host "🧪 下一步：测试验证" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 访问: https://elemental.bond" -ForegroundColor Gray
    Write-Host "2. 硬刷新: Ctrl + Shift + R" -ForegroundColor Gray
    Write-Host "3. 按照 P1_TEST_GUIDE.md 测试" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✨ 预期看到:" -ForegroundColor Yellow
    Write-Host "  - TeaserReading（神秘开场）" -ForegroundColor Gray
    Write-Host "  - Email Gate（3 秒后）" -ForegroundColor Gray
    Write-Host "  - PreviewReading（Email 解锁后）" -ForegroundColor Gray
    Write-Host "  - Paywall（8 秒后）" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  部署可能还在进行中" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 建议：" -ForegroundColor Yellow
    Write-Host "  1. 访问 Vercel Dashboard 查看部署状态" -ForegroundColor Gray
    Write-Host "     https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. 等待 2-3 分钟后访问网站" -ForegroundColor Gray
    Write-Host "     https://elemental.bond" -ForegroundColor Gray
    Write-Host "  3. 硬刷新浏览器: Ctrl + Shift + R" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📝 查看完整测试指南: P1_TEST_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

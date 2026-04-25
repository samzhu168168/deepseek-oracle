# 推送到 GitHub 脚本（带重试）
# 使用方法: .\push-to-github.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "推送代码到 GitHub（带自动重试）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$maxRetries = 10
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    
    Write-Host "尝试 $retryCount/$maxRetries ..." -ForegroundColor Yellow
    
    try {
        # 尝试推送
        git push origin main 2>&1 | Tee-Object -Variable output
        
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host ""
            Write-Host "✅ 推送成功！" -ForegroundColor Green
            Write-Host ""
            Write-Host "下一步：" -ForegroundColor Cyan
            Write-Host "1. 访问 https://vercel.com" -ForegroundColor White
            Write-Host "2. 使用 GitHub 账号登录" -ForegroundColor White
            Write-Host "3. 点击 'Add New...' → 'Project'" -ForegroundColor White
            Write-Host "4. 导入 samzhu168168/deepseek-oracle" -ForegroundColor White
            Write-Host "5. 点击 'Deploy' 并等待 2-3 分钟" -ForegroundColor White
            Write-Host ""
            Write-Host "详细步骤请查看: DEPLOY_TO_VERCEL_NOW.md" -ForegroundColor Cyan
            break
        }
    }
    catch {
        Write-Host "❌ 推送失败: $_" -ForegroundColor Red
    }
    
    if (-not $success) {
        if ($retryCount -lt $maxRetries) {
            $waitTime = [Math]::Min(5 * $retryCount, 30)
            Write-Host "等待 $waitTime 秒后重试..." -ForegroundColor Yellow
            Start-Sleep -Seconds $waitTime
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ 推送失败（已重试 $maxRetries 次）" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "1. 网络连接不稳定" -ForegroundColor White
    Write-Host "2. GitHub 服务器问题" -ForegroundColor White
    Write-Host "3. 防火墙或代理设置" -ForegroundColor White
    Write-Host ""
    Write-Host "解决方案：" -ForegroundColor Cyan
    Write-Host "1. 检查网络连接: ping github.com" -ForegroundColor White
    Write-Host "2. 使用 VPN 或更换网络" -ForegroundColor White
    Write-Host "3. 稍后再试" -ForegroundColor White
    Write-Host "4. 或者在 GitHub 网站手动上传文件" -ForegroundColor White
    Write-Host ""
    Write-Host "手动上传步骤：" -ForegroundColor Cyan
    Write-Host "1. 访问 https://github.com/samzhu168168/deepseek-oracle" -ForegroundColor White
    Write-Host "2. 点击 'Add file' → 'Upload files'" -ForegroundColor White
    Write-Host "3. 拖拽以下文件：" -ForegroundColor White
    Write-Host "   - vercel.json" -ForegroundColor Gray
    Write-Host "   - frontend/.vercelignore" -ForegroundColor Gray
    Write-Host "   - frontend/.env.production" -ForegroundColor Gray
    Write-Host "   - DEPLOY_TO_VERCEL_NOW.md" -ForegroundColor Gray
    Write-Host "   - VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
    Write-Host "4. 提交更改" -ForegroundColor White
    Write-Host ""
    
    exit 1
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

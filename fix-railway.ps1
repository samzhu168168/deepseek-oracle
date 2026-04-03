# Railway 后端快速修复脚本

Write-Host "🔧 Railway 后端修复工具" -ForegroundColor Cyan
Write-Host ""

# 检查当前状态
Write-Host "1. 检查当前部署状态..." -ForegroundColor Yellow
$backendUrl = "https://deepseek-oracle-backend-production.up.railway.app/health"

try {
    $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 10
    Write-Host "   ✅ 后端正常运行!" -ForegroundColor Green
    Write-Host "   状态: $($response.status)" -ForegroundColor Green
    Write-Host ""
    Write-Host "后端已经正常，无需修复。" -ForegroundColor Green
    exit 0
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ 后端错误: HTTP $statusCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. 分析问题..." -ForegroundColor Yellow

if ($statusCode -eq 404) {
    Write-Host "   问题: 404 Not Found" -ForegroundColor Red
    Write-Host "   可能原因:" -ForegroundColor Yellow
    Write-Host "     - 部署还在进行中" -ForegroundColor Gray
    Write-Host "     - 启动命令配置错误" -ForegroundColor Gray
    Write-Host "     - Flask 应用没有正确启动" -ForegroundColor Gray
} elseif ($statusCode -eq 503) {
    Write-Host "   问题: 503 Service Unavailable" -ForegroundColor Red
    Write-Host "   可能原因:" -ForegroundColor Yellow
    Write-Host "     - 服务正在启动" -ForegroundColor Gray
    Write-Host "     - 应用崩溃" -ForegroundColor Gray
} else {
    Write-Host "   问题: 未知错误 (HTTP $statusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. 建议的修复步骤:" -ForegroundColor Yellow
Write-Host ""

Write-Host "   选项 1: 等待部署完成 (推荐)" -ForegroundColor Cyan
Write-Host "   ----------------------------------------" -ForegroundColor Gray
Write-Host "   Railway 部署通常需要 3-5 分钟" -ForegroundColor White
Write-Host "   运行: .\monitor-deploy.ps1" -ForegroundColor Green
Write-Host ""

Write-Host "   选项 2: 检查 Railway 配置" -ForegroundColor Cyan
Write-Host "   ----------------------------------------" -ForegroundColor Gray
Write-Host "   1. 访问: https://railway.app/dashboard" -ForegroundColor White
Write-Host "   2. 检查 Deployments 状态" -ForegroundColor White
Write-Host "   3. 查看 Build Logs 和 Deploy Logs" -ForegroundColor White
Write-Host "   4. 确认启动命令: python run.py" -ForegroundColor White
Write-Host "   5. 确认根目录: backend" -ForegroundColor White
Write-Host ""

Write-Host "   选项 3: 手动触发重新部署" -ForegroundColor Cyan
Write-Host "   ----------------------------------------" -ForegroundColor Gray
Write-Host "   在 Railway 项目页面点击 'Redeploy'" -ForegroundColor White
Write-Host "   或运行:" -ForegroundColor White
Write-Host "   git commit --allow-empty -m 'chore: Trigger redeploy'" -ForegroundColor Green
Write-Host "   git push" -ForegroundColor Green
Write-Host ""

Write-Host "   选项 4: 添加 Gunicorn (生产环境推荐)" -ForegroundColor Cyan
Write-Host "   ----------------------------------------" -ForegroundColor Gray
Write-Host "   这将使用生产级 WSGI 服务器" -ForegroundColor White
Write-Host ""

$choice = Read-Host "选择一个选项 (1-4) 或按 Enter 退出"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "启动部署监控..." -ForegroundColor Cyan
        .\monitor-deploy.ps1
    }
    "2" {
        Write-Host ""
        Write-Host "打开 Railway 控制台..." -ForegroundColor Cyan
        Start-Process "https://railway.app/dashboard"
    }
    "3" {
        Write-Host ""
        Write-Host "触发重新部署..." -ForegroundColor Cyan
        git commit --allow-empty -m "chore: Trigger Railway redeploy"
        git push
        Write-Host ""
        Write-Host "已推送空提交，等待部署..." -ForegroundColor Green
        Start-Sleep -Seconds 5
        .\monitor-deploy.ps1
    }
    "4" {
        Write-Host ""
        Write-Host "添加 Gunicorn..." -ForegroundColor Cyan
        
        # 检查是否已经有 gunicorn
        $requirements = Get-Content "backend/requirements.txt"
        if ($requirements -match "gunicorn") {
            Write-Host "   Gunicorn 已经在 requirements.txt 中" -ForegroundColor Yellow
        } else {
            Add-Content -Path "backend/requirements.txt" -Value "gunicorn==21.2.0"
            Write-Host "   ✅ 已添加 gunicorn 到 requirements.txt" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "提交更改..." -ForegroundColor Cyan
        git add backend/requirements.txt
        git commit -m "feat: Add gunicorn for production deployment"
        git push
        
        Write-Host ""
        Write-Host "✅ 已推送更改" -ForegroundColor Green
        Write-Host ""
        Write-Host "下一步: 在 Railway 设置启动命令为:" -ForegroundColor Yellow
        Write-Host "gunicorn run:app --bind 0.0.0.0:`$PORT --workers 2 --timeout 120" -ForegroundColor Green
        Write-Host ""
        
        $openRailway = Read-Host "是否打开 Railway 控制台? (y/n)"
        if ($openRailway -eq "y") {
            Start-Process "https://railway.app/dashboard"
        }
        
        Write-Host ""
        Write-Host "等待部署完成..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        .\monitor-deploy.ps1
    }
    default {
        Write-Host ""
        Write-Host "退出修复工具" -ForegroundColor Gray
    }
}

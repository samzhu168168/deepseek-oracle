# 部署状态测试脚本
# 用于快速检查 Vercel 和 Railway 的部署状态

Write-Host "🔍 开始检查部署状态..." -ForegroundColor Cyan
Write-Host ""

# 测试后端健康检查
Write-Host "1️⃣  测试后端健康检查..." -ForegroundColor Yellow
$backendUrl = "https://deepseek-oracle-backend-production.up.railway.app/health"

try {
    $response = Invoke-RestMethod -Uri $backendUrl -Method Get -TimeoutSec 10
    
    if ($response.status -eq "ok") {
        Write-Host "   ✅ 后端正常运行" -ForegroundColor Green
        Write-Host "   📍 URL: $backendUrl" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  后端响应异常: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 后端无法访问" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 可能原因：" -ForegroundColor Yellow
    Write-Host "      - Railway 服务未启动" -ForegroundColor Gray
    Write-Host "      - 网络连接问题" -ForegroundColor Gray
    Write-Host "      - 部署正在进行中" -ForegroundColor Gray
}

Write-Host ""

# 测试前端
Write-Host "2️⃣  测试前端..." -ForegroundColor Yellow
$frontendUrl = "https://www.elemental.bond"

try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 10 -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ 前端正常运行" -ForegroundColor Green
        Write-Host "   📍 URL: $frontendUrl" -ForegroundColor Gray
        Write-Host "   📦 内容大小: $($response.Content.Length) bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ 前端无法访问" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试 API 端点
Write-Host "3️⃣  测试 API 端点..." -ForegroundColor Yellow
$apiEndpoints = @(
    "/api/health",
    "/api/capture-email",
    "/api/verify-license"
)

foreach ($endpoint in $apiEndpoints) {
    $url = "https://deepseek-oracle-backend-production.up.railway.app$endpoint"
    
    try {
        if ($endpoint -eq "/api/health") {
            $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
            Write-Host "   ✅ $endpoint - OK" -ForegroundColor Green
        } else {
            # 其他端点只测试是否可达（OPTIONS 请求）
            $response = Invoke-WebRequest -Uri $url -Method Options -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 204) {
                Write-Host "   ✅ $endpoint - CORS OK" -ForegroundColor Green
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 405 -or $statusCode -eq 400) {
            Write-Host "   ⚠️  $endpoint - 端点存在但需要正确的请求" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $endpoint - 无法访问 ($statusCode)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 检查 Git 状态
Write-Host "4️⃣  检查 Git 状态..." -ForegroundColor Yellow

$gitStatus = git status --porcelain
$gitBranch = git branch --show-current
$gitRemote = git rev-parse --abbrev-ref '@{upstream}'

Write-Host "   📌 当前分支: $gitBranch" -ForegroundColor Gray
Write-Host "   📌 远程分支: $gitRemote" -ForegroundColor Gray

if ($gitStatus) {
    Write-Host "   ⚠️  有未提交的更改" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
} else {
    Write-Host "   ✅ 工作目录干净" -ForegroundColor Green
}

# 检查是否有未推送的提交
try {
    $unpushed = git log '@{u}..' --oneline 2>$null
    if ($unpushed) {
        Write-Host "   ⚠️  有未推送的提交:" -ForegroundColor Yellow
        Write-Host $unpushed -ForegroundColor Gray
        Write-Host "   💡 运行 'git push' 推送到远程" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ 所有提交已推送" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  无法检查未推送的提交" -ForegroundColor Yellow
}

Write-Host ""

# 总结
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 检查总结" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 快速链接:" -ForegroundColor White
Write-Host "   • 生产网站: https://www.elemental.bond" -ForegroundColor Gray
Write-Host "   • Vercel 控制台: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   • Railway 控制台: https://railway.app/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 相关文档:" -ForegroundColor White
Write-Host "   • NETWORK_ISSUE_FIX.md - 网络问题修复方案" -ForegroundColor Gray
Write-Host "   • FINAL_CHECKLIST.md - 最终检查清单" -ForegroundColor Gray
Write-Host "   • DEPLOYMENT_IN_PROGRESS.md - 部署进度" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ 检查完成！" -ForegroundColor Green

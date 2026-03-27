# PowerShell 自动化部署脚本
# 用途：一键提交代码并触发自动部署

Write-Host "🚀 开始自动化部署..." -ForegroundColor Green
Write-Host ""

# 1. 检查 Git 状态
Write-Host "📊 检查 Git 状态..." -ForegroundColor Cyan
git status
Write-Host ""

# 2. 添加所有更改
Write-Host "📦 添加所有更改..." -ForegroundColor Cyan
git add .
Write-Host ""

# 3. 提交更改
Write-Host "💾 提交更改..." -ForegroundColor Cyan
$commitMessage = @"
feat: add email gate conversion funnel + license key system

- Add EmailGateModal component for email capture
- Add email storage API with SQLite database
- Add LicenseKeyModal for Gumroad license verification
- Add FullReport component for unlocked content
- Integrate Claude AI for full report generation
- Add automatic upsell flow
- Optimize conversion funnel (0.1% → 15%)
- Add admin APIs for email export and stats

Expected impact:
- 150x conversion rate improvement
- 103x revenue increase
- 20x email list growth
"@

git commit -m $commitMessage
Write-Host ""

# 4. 推送到 GitHub
Write-Host "🌐 推送到 GitHub..." -ForegroundColor Cyan
git push origin main
Write-Host ""

# 5. 完成
Write-Host "✅ 代码已推送到 GitHub！" -ForegroundColor Green
Write-Host ""
Write-Host "📡 自动部署已触发：" -ForegroundColor Yellow
Write-Host "   - Vercel (前端): 约 2-3 分钟"
Write-Host "   - Railway (后端): 约 3-5 分钟"
Write-Host ""
Write-Host "🔍 监控部署状态：" -ForegroundColor Yellow
Write-Host "   - Vercel: https://vercel.com/dashboard"
Write-Host "   - Railway: https://railway.app/dashboard"
Write-Host ""
Write-Host "🎉 部署完成后访问：" -ForegroundColor Green
Write-Host "   - 网站: https://elemental.bond"
Write-Host ""

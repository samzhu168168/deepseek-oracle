# Elemental Bond — 一键构建 & 部署
# 在项目根目录终端执行: powershell -ExecutionPolicy Bypass -File deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location "F:\MyTraeProjects\ElementalBond"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Elemental Bond - 构建 & 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. 构建前端 ──
Write-Host "[1/3] npm run build..." -ForegroundColor Yellow
Set-Location frontend
npm install 2>&1 | Out-Null
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    Read-Host
    exit 1
}
Write-Host "✅ 构建成功" -ForegroundColor Green
Set-Location ..

# ── 2. Git 提交 ──
Write-Host ""
Write-Host "[2/3] git commit..." -ForegroundColor Yellow
git add -A
git status --short
$commitMsg = @"
fix: markdown rendering, gumroad payment flow, share URLs, OG images, remove Chinese text

- Replace raw text with react-markdown in Teaser/Preview/Free/FullReport
- Add post-payment Gumroad redirect detection and auto License Key modal
- Generate unique shareable URLs with base64 encoded result data
- Add dynamic OG image endpoint (/api/og-image) with Pillow + SVG fallback
- Remove all user-facing Chinese text from English pages
- Simplify PaidReading to direct Gumroad checkout flow
"@
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ 无新内容提交（可能已提交）" -ForegroundColor DarkYellow
}

# ── 3. 推送 ──
Write-Host ""
Write-Host "[3/3] git push..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Read-Host
    exit 1
}
Write-Host "✅ 推送成功！Vercel 自动部署中..." -ForegroundColor Green
Write-Host ""
Write-Host "验证: https://elemental.bond" -ForegroundColor Cyan
Read-Host

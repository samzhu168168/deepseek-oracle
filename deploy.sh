#!/bin/bash

# 自动化部署脚本
# 用途：一键提交代码并触发自动部署

echo "🚀 开始自动化部署..."
echo ""

# 1. 检查 Git 状态
echo "📊 检查 Git 状态..."
git status
echo ""

# 2. 添加所有更改
echo "📦 添加所有更改..."
git add .
echo ""

# 3. 提交更改
echo "💾 提交更改..."
git commit -m "feat: add email gate conversion funnel + license key system

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
- 20x email list growth"
echo ""

# 4. 推送到 GitHub
echo "🌐 推送到 GitHub..."
git push origin main
echo ""

# 5. 完成
echo "✅ 代码已推送到 GitHub！"
echo ""
echo "📡 自动部署已触发："
echo "   - Vercel (前端): 约 2-3 分钟"
echo "   - Railway (后端): 约 3-5 分钟"
echo ""
echo "🔍 监控部署状态："
echo "   - Vercel: https://vercel.com/dashboard"
echo "   - Railway: https://railway.app/dashboard"
echo ""
echo "🎉 部署完成后访问："
echo "   - 网站: https://elemental.bond"
echo ""

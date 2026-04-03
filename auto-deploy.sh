#!/bin/bash
# 自动化部署脚本（Linux/Mac）
# 用于自动安装依赖并部署到 Vercel 和 Railway

echo "🚀 开始自动化部署..."

# 步骤 1: 安装前端依赖
echo ""
echo "📦 步骤 1/4: 安装前端依赖 (Zustand)..."
cd frontend

echo "正在安装 npm 依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功！"
else
    echo "❌ 前端依赖安装失败，但继续执行..."
fi

cd ..

# 步骤 2: 安装后端依赖
echo ""
echo "📦 步骤 2/4: 安装后端依赖 (tiktoken)..."
cd backend

echo "正在安装 pip 依赖..."

# 尝试激活虚拟环境
if [ -f ".venv/bin/activate" ]; then
    echo "激活虚拟环境..."
    source .venv/bin/activate
fi

pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ 后端依赖安装成功！"
else
    echo "❌ 后端依赖安装失败，但继续执行..."
fi

cd ..

# 步骤 3: 提交到 Git
echo ""
echo "📝 步骤 3/4: 提交代码到 Git..."

git add .
git commit -m "chore: Auto-install Zustand and tiktoken dependencies"

if [ $? -eq 0 ]; then
    echo "✅ 代码提交成功！"
else
    echo "⚠️  没有新的更改需要提交"
fi

# 步骤 4: 推送到 GitHub
echo ""
echo "🚀 步骤 4/4: 推送到 GitHub..."

git push

if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功！"
else
    echo "❌ 代码推送失败"
    exit 1
fi

# 完成
echo ""
echo "✨ 自动化部署完成！"
echo ""
echo "📊 部署状态:"
echo "  • Vercel (前端): 正在自动部署..."
echo "  • Railway (后端): 正在自动部署..."
echo ""
echo "⏰ 预计 2-3 分钟后部署完成"
echo ""
echo "🔗 查看部署状态:"
echo "  • Vercel: https://vercel.com/dashboard"
echo "  • Railway: https://railway.app/dashboard"
echo ""
echo "🌐 生产网站: https://www.elemental.bond"

# 自动化部署脚本
# 用于自动安装依赖并部署到 Vercel 和 Railway

Write-Host "🚀 开始自动化部署..." -ForegroundColor Green

# 步骤 1: 安装前端依赖
Write-Host "`n📦 步骤 1/4: 安装前端依赖 (Zustand)..." -ForegroundColor Cyan
Set-Location frontend

try {
    Write-Host "正在安装 npm 依赖..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 前端依赖安装成功！" -ForegroundColor Green
    } else {
        Write-Host "❌ 前端依赖安装失败，但继续执行..." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 前端依赖安装出错: $_" -ForegroundColor Red
}

Set-Location ..

# 步骤 2: 安装后端依赖
Write-Host "`n📦 步骤 2/4: 安装后端依赖 (tiktoken)..." -ForegroundColor Cyan
Set-Location backend

try {
    Write-Host "正在安装 pip 依赖..." -ForegroundColor Yellow
    
    # 尝试激活虚拟环境
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        Write-Host "激活虚拟环境..." -ForegroundColor Yellow
        & .\.venv\Scripts\Activate.ps1
    }
    
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 后端依赖安装成功！" -ForegroundColor Green
    } else {
        Write-Host "❌ 后端依赖安装失败，但继续执行..." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 后端依赖安装出错: $_" -ForegroundColor Red
}

Set-Location ..

# 步骤 3: 提交到 Git
Write-Host "`n📝 步骤 3/4: 提交代码到 Git..." -ForegroundColor Cyan

try {
    git add .
    git commit -m "chore: Auto-install Zustand and tiktoken dependencies"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码提交成功！" -ForegroundColor Green
    } else {
        Write-Host "⚠️  没有新的更改需要提交" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Git 提交出错: $_" -ForegroundColor Red
}

# 步骤 4: 推送到 GitHub
Write-Host "`n🚀 步骤 4/4: 推送到 GitHub..." -ForegroundColor Cyan

try {
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码推送成功！" -ForegroundColor Green
    } else {
        Write-Host "❌ 代码推送失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Git 推送出错: $_" -ForegroundColor Red
    exit 1
}

# 完成
Write-Host "`n✨ 自动化部署完成！" -ForegroundColor Green
Write-Host "`n📊 部署状态:" -ForegroundColor Cyan
Write-Host "  • Vercel (前端): 正在自动部署..." -ForegroundColor Yellow
Write-Host "  • Railway (后端): 正在自动部署..." -ForegroundColor Yellow
Write-Host "`n⏰ 预计 2-3 分钟后部署完成" -ForegroundColor Cyan
Write-Host "`n🔗 查看部署状态:" -ForegroundColor Cyan
Write-Host "  • Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  • Railway: https://railway.app/dashboard" -ForegroundColor White
Write-Host "`n🌐 生产网站: https://www.elemental.bond" -ForegroundColor Green

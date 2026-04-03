# Render 部署助手脚本

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Render.com Deployment Helper" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you deploy to Render.com" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check if gunicorn is in requirements.txt
Write-Host "[1/5] Checking requirements.txt..." -ForegroundColor Yellow
$requirements = Get-Content "backend/requirements.txt"
if ($requirements -match "gunicorn") {
    Write-Host "      gunicorn found in requirements.txt" -ForegroundColor Green
} else {
    Write-Host "      ERROR: gunicorn not found!" -ForegroundColor Red
    Write-Host "      Please run: Add-Content -Path 'backend/requirements.txt' -Value 'gunicorn==21.2.0'" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check git status
Write-Host ""
Write-Host "[2/5] Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "      Uncommitted changes found" -ForegroundColor Yellow
    Write-Host ""
    $commit = Read-Host "      Commit and push changes now? (y/n)"
    if ($commit -eq "y") {
        git add .
        git commit -m "feat: Prepare for Render deployment"
        Write-Host "      Pushing to GitHub..." -ForegroundColor Cyan
        git push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      Push successful!" -ForegroundColor Green
        } else {
            Write-Host "      Push failed. Please push manually later." -ForegroundColor Red
        }
    }
} else {
    Write-Host "      Working directory clean" -ForegroundColor Green
}

# Step 3: Open Render
Write-Host ""
Write-Host "[3/5] Opening Render.com..." -ForegroundColor Yellow
Start-Process "https://render.com"
Write-Host "      Render.com opened in browser" -ForegroundColor Green

# Step 4: Show configuration
Write-Host ""
Write-Host "[4/5] Render Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy these settings when creating your Web Service:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Basic Settings:" -ForegroundColor White
Write-Host "  Name: " -NoNewline -ForegroundColor Gray
Write-Host "deepseek-oracle-backend" -ForegroundColor Green
Write-Host "  Region: " -NoNewline -ForegroundColor Gray
Write-Host "Singapore" -ForegroundColor Green
Write-Host "  Branch: " -NoNewline -ForegroundColor Gray
Write-Host "main" -ForegroundColor Green
Write-Host ""
Write-Host "Build & Deploy:" -ForegroundColor White
Write-Host "  Root Directory: " -NoNewline -ForegroundColor Gray
Write-Host "backend" -ForegroundColor Green
Write-Host "  Runtime: " -NoNewline -ForegroundColor Gray
Write-Host "Python 3" -ForegroundColor Green
Write-Host "  Build Command: " -NoNewline -ForegroundColor Gray
Write-Host "pip install -r requirements.txt" -ForegroundColor Green
Write-Host "  Start Command: " -NoNewline -ForegroundColor Gray
Write-Host "gunicorn run:app --bind 0.0.0.0:`$PORT --workers 2 --timeout 120" -ForegroundColor Green
Write-Host ""
Write-Host "Environment Variables:" -ForegroundColor White
Write-Host "  ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1" -ForegroundColor Green
Write-Host "  ANTHROPIC_BASE_URL=https://api.laozhang.ai" -ForegroundColor Green
Write-Host "  GUMROAD_PRODUCT_ID=bhpmxr" -ForegroundColor Green
Write-Host "  FLASK_ENV=production" -ForegroundColor Green
Write-Host "  PYTHON_VERSION=3.11.0" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for deployment
Write-Host "[5/5] Next Steps" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Sign up with GitHub on Render.com" -ForegroundColor White
Write-Host "2. Create a new Web Service" -ForegroundColor White
Write-Host "3. Select the 'deepseek-oracle' repository" -ForegroundColor White
Write-Host "4. Copy the configuration shown above" -ForegroundColor White
Write-Host "5. Add all environment variables" -ForegroundColor White
Write-Host "6. Click 'Create Web Service'" -ForegroundColor White
Write-Host "7. Wait 5-10 minutes for deployment" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Press Enter when deployment is complete..."

Write-Host ""
Write-Host "Testing Render deployment..." -ForegroundColor Yellow
$renderUrl = Read-Host "Enter your Render URL (e.g., https://deepseek-oracle-backend.onrender.com)"

if ($renderUrl) {
    try {
        $response = Invoke-RestMethod -Uri "$renderUrl/health" -TimeoutSec 10
        Write-Host ""
        Write-Host "SUCCESS! Backend is working on Render!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Update Vercel environment variable" -ForegroundColor Yellow
        Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Open your project Settings" -ForegroundColor White
        Write-Host "3. Environment Variables -> VITE_API_URL" -ForegroundColor White
        Write-Host "4. Change to: $renderUrl" -ForegroundColor White
        Write-Host "5. Redeploy frontend" -ForegroundColor White
        Write-Host ""
        
        $openVercel = Read-Host "Open Vercel dashboard? (y/n)"
        if ($openVercel -eq "y") {
            Start-Process "https://vercel.com/dashboard"
        }
    } catch {
        Write-Host ""
        Write-Host "Backend not responding yet." -ForegroundColor Red
        Write-Host "Please wait a few more minutes and try:" -ForegroundColor Yellow
        Write-Host "Invoke-RestMethod -Uri '$renderUrl/health'" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "For detailed guide, see: RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

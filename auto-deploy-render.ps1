# 自动化部署到 Render - 完全指导脚本

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Automated Render Deployment" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will guide you through deploying to Render.com" -ForegroundColor Yellow
Write-Host "You only need to click 4 times!" -ForegroundColor Green
Write-Host ""

# Step 1: Push code
Write-Host "[Step 1/5] Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host ""

$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "Uncommitted changes found. Committing..." -ForegroundColor Gray
    git add .
    git commit -m "feat: Prepare for Render deployment"
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
$pushAttempts = 0
$maxAttempts = 3

while ($pushAttempts -lt $maxAttempts) {
    $pushAttempts++
    Write-Host "  Attempt $pushAttempts/$maxAttempts..." -ForegroundColor Gray
    
    git push 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Push successful!" -ForegroundColor Green
        break
    }
    
    if ($pushAttempts -lt $maxAttempts) {
        Write-Host "  Push failed, retrying in 5 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "  Push failed after $maxAttempts attempts" -ForegroundColor Red
        Write-Host "  Please check your network and try manually: git push" -ForegroundColor Yellow
        $continue = Read-Host "  Continue anyway? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
}

Write-Host ""

# Step 2: Open Render
Write-Host "[Step 2/5] Opening Render.com..." -ForegroundColor Yellow
Write-Host ""
Write-Host "I will open Render.com in your browser." -ForegroundColor White
Write-Host "Please follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Click 'Sign up with GitHub'" -ForegroundColor White
Write-Host "  2. Authorize Render to access your GitHub" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to open Render.com"
Start-Process "https://render.com"

Write-Host ""
Write-Host "Waiting for you to sign up..." -ForegroundColor Gray
Read-Host "Press Enter after you've signed up"

# Step 3: Create Blueprint
Write-Host ""
Write-Host "[Step 3/5] Creating Blueprint..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Now, in Render:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Click the 'New +' button (top right)" -ForegroundColor White
Write-Host "  2. Select 'Blueprint'" -ForegroundColor White
Write-Host "  3. Find and select 'deepseek-oracle' repository" -ForegroundColor White
Write-Host "  4. Click 'Connect'" -ForegroundColor White
Write-Host ""
Write-Host "Render will automatically read the render.yaml file!" -ForegroundColor Green
Write-Host "All configuration is already set up!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter after you've clicked 'Connect'"

# Step 4: Apply Blueprint
Write-Host ""
Write-Host "[Step 4/5] Applying Blueprint..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Render should now show the configuration from render.yaml:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Service: deepseek-oracle-backend" -ForegroundColor Gray
Write-Host "  Type: Web Service" -ForegroundColor Gray
Write-Host "  Region: Singapore" -ForegroundColor Gray
Write-Host "  Plan: Free" -ForegroundColor Gray
Write-Host ""
Write-Host "Click 'Apply' to start deployment!" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter after you've clicked 'Apply'"

# Step 5: Wait for deployment
Write-Host ""
Write-Host "[Step 5/5] Waiting for deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Render is now deploying your backend. This takes 5-10 minutes." -ForegroundColor White
Write-Host ""
Write-Host "You can watch the progress in the Render dashboard." -ForegroundColor Gray
Write-Host "Look for:" -ForegroundColor Cyan
Write-Host "  - Build Logs: Should show 'Successfully installed gunicorn'" -ForegroundColor Gray
Write-Host "  - Deploy Logs: Should show 'Running on http://0.0.0.0:xxxx'" -ForegroundColor Gray
Write-Host ""

$wait = Read-Host "Wait 10 minutes now? (y/n)"

if ($wait -eq "y") {
    Write-Host ""
    Write-Host "Waiting 10 minutes for deployment..." -ForegroundColor Cyan
    
    for ($i = 10; $i -gt 0; $i--) {
        Write-Host "  $i minutes remaining..." -ForegroundColor Gray
        Start-Sleep -Seconds 60
    }
    
    Write-Host ""
    Write-Host "Deployment should be complete!" -ForegroundColor Green
}

# Get Render URL
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "Please copy your Render URL from the dashboard." -ForegroundColor Yellow
Write-Host "It should look like: https://deepseek-oracle-backend.onrender.com" -ForegroundColor Gray
Write-Host ""

$renderUrl = Read-Host "Enter your Render URL"

if ($renderUrl) {
    Write-Host ""
    Write-Host "Testing backend..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$renderUrl/health" -TimeoutSec 10
        Write-Host "SUCCESS! Backend is working!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Backend not responding yet. It may still be starting up." -ForegroundColor Yellow
        Write-Host "Wait a few more minutes and test manually:" -ForegroundColor Gray
        Write-Host "  Invoke-RestMethod -Uri '$renderUrl/health'" -ForegroundColor White
        Write-Host ""
    }
    
    # Update Vercel
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host "  Update Vercel Environment Variable" -ForegroundColor Yellow
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now you need to update Vercel to use the new backend URL." -ForegroundColor White
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to Vercel dashboard" -ForegroundColor White
    Write-Host "  2. Open your project" -ForegroundColor White
    Write-Host "  3. Go to Settings -> Environment Variables" -ForegroundColor White
    Write-Host "  4. Find VITE_API_URL" -ForegroundColor White
    Write-Host "  5. Change it to: $renderUrl" -ForegroundColor Green
    Write-Host "  6. Click Save" -ForegroundColor White
    Write-Host "  7. Click Redeploy" -ForegroundColor White
    Write-Host ""
    
    $openVercel = Read-Host "Open Vercel dashboard now? (y/n)"
    if ($openVercel -eq "y") {
        Start-Process "https://vercel.com/dashboard"
    }
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  All Done!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  1. Code pushed to GitHub" -ForegroundColor White
Write-Host "  2. Backend deployed to Render" -ForegroundColor White
Write-Host "  3. Update Vercel environment variable" -ForegroundColor White
Write-Host "  4. Wait for Vercel to redeploy (3-5 minutes)" -ForegroundColor White
Write-Host "  5. Test your website!" -ForegroundColor White
Write-Host ""
Write-Host "Your website: https://www.elemental.bond" -ForegroundColor Green
Write-Host ""

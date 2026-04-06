# Auto Deploy Script - Simple Version
# Push to GitHub with retry and monitor Vercel deployment

Write-Host "Starting auto deployment..." -ForegroundColor Cyan
Write-Host ""

# Push to GitHub with retry
$maxRetries = 10
$retryDelay = 5
$pushSuccess = $false

Write-Host "Step 1: Pushing to GitHub..." -ForegroundColor Yellow

for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "Attempt $i/$maxRetries..." -ForegroundColor Gray
    
    $result = git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful!" -ForegroundColor Green
        $pushSuccess = $true
        break
    }
    
    Write-Host "Push failed. Retrying in $retryDelay seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds $retryDelay
}

if (-not $pushSuccess) {
    Write-Host ""
    Write-Host "Failed to push after $maxRetries attempts" -ForegroundColor Red
    Write-Host "Please check your network and try manually: git push origin main" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Waiting for Vercel deployment..." -ForegroundColor Yellow
Write-Host "Vercel is auto-deploying from GitHub..." -ForegroundColor Gray
Write-Host "Expected time: 2-3 minutes" -ForegroundColor Gray
Write-Host ""

# Wait 30 seconds for Vercel to start
Write-Host "Waiting 30 seconds for Vercel to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Monitor deployment
Write-Host ""
Write-Host "Step 3: Monitoring deployment..." -ForegroundColor Yellow

$url = "https://elemental.bond"
$maxWaitMinutes = 5
$startTime = Get-Date
$maxWaitTime = $startTime.AddMinutes($maxWaitMinutes)

while ((Get-Date) -lt $maxWaitTime) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "Deployment successful!" -ForegroundColor Green
            Write-Host "Website is live at: $url" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Visit: $url" -ForegroundColor Gray
            Write-Host "2. Hard refresh: Ctrl + Shift + R" -ForegroundColor Gray
            Write-Host "3. Test according to P1_TEST_GUIDE.md" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Expected changes:" -ForegroundColor Yellow
            Write-Host "- TeaserReading (mysterious opening)" -ForegroundColor Gray
            Write-Host "- Email Gate (after 3 seconds)" -ForegroundColor Gray
            Write-Host "- PreviewReading (after email unlock)" -ForegroundColor Gray
            Write-Host "- Paywall (after 8 seconds)" -ForegroundColor Gray
            Write-Host ""
            exit 0
        }
    }
    catch {
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
        Write-Host "Waiting for deployment... ($elapsed seconds)" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Deployment may still be in progress" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please:" -ForegroundColor Yellow
Write-Host "1. Check Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "2. Wait 2-3 minutes and visit: $url" -ForegroundColor Gray
Write-Host "3. Hard refresh: Ctrl + Shift + R" -ForegroundColor Gray
Write-Host ""

# Git push with retry mechanism

$maxRetries = 5
$retryDelay = 10

Write-Host "Attempting to push to GitHub..." -ForegroundColor Cyan

for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "Attempt $i of $maxRetries..." -ForegroundColor Yellow
    
    try {
        git push 2>&1 | Out-String | Write-Host
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Push successful!" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    if ($i -lt $maxRetries) {
        Write-Host "Waiting $retryDelay seconds before retry..." -ForegroundColor Gray
        Start-Sleep -Seconds $retryDelay
    }
}

Write-Host ""
Write-Host "Failed to push after $maxRetries attempts" -ForegroundColor Red
Write-Host ""
Write-Host "Possible solutions:" -ForegroundColor Yellow
Write-Host "1. Check your internet connection" -ForegroundColor White
Write-Host "2. Try again later when network is stable" -ForegroundColor White
Write-Host "3. Use SSH instead: git remote set-url origin git@github.com:samzhu168168/deepseek-oracle.git" -ForegroundColor White

exit 1

# Test script to verify expense API
# First, you need a valid token. Login first to get one.

Write-Host "Testing Expense API..." -ForegroundColor Cyan

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
curl http://localhost:5000/api/health

Write-Host "`n`nTo test expense creation, you need to:" -ForegroundColor Green
Write-Host "1. Stop the backend server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Restart it with: npm start" -ForegroundColor White
Write-Host "3. Login to get a fresh token" -ForegroundColor White
Write-Host "4. Try submitting the expense again" -ForegroundColor White

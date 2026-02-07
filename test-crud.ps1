$BASE_URL = "http://localhost:8888/.netlify/functions"

Write-Host "=== GET All Attendance ===" -ForegroundColor Green
$result = Invoke-WebRequest -Uri "${BASE_URL}/get-attendance" -Headers @{"Content-Type"="application/json"} -Method GET
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== POST Add Attendance ===" -ForegroundColor Green
$body = @{
    name = "Budi"
    timestamp = "2026-02-07T10:00:00Z"
} | ConvertTo-Json

$result = Invoke-WebRequest -Uri "${BASE_URL}/add-attendance" `
  -Headers @{"Content-Type"="application/json"} `
  -Method POST `
  -Body $body
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== GET All After Add ===" -ForegroundColor Green
$result = Invoke-WebRequest -Uri "${BASE_URL}/get-attendance" -Headers @{"Content-Type"="application/json"} -Method GET
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== PUT Update (ID 1) ===" -ForegroundColor Green
$body = @{
    name = "Budi Updated"
} | ConvertTo-Json

$result = Invoke-WebRequest -Uri "${BASE_URL}/update-attendance?id=1" `
  -Headers @{"Content-Type"="application/json"} `
  -Method PUT `
  -Body $body
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== GET All After Update ===" -ForegroundColor Green
$result = Invoke-WebRequest -Uri "${BASE_URL}/get-attendance" -Headers @{"Content-Type"="application/json"} -Method GET
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== DELETE (ID 1) ===" -ForegroundColor Green
$result = Invoke-WebRequest -Uri "${BASE_URL}/delete-attendance?id=1" `
  -Headers @{"Content-Type"="application/json"} `
  -Method DELETE
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== GET All After Delete ===" -ForegroundColor Green
$result = Invoke-WebRequest -Uri "${BASE_URL}/get-attendance" -Headers @{"Content-Type"="application/json"} -Method GET
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

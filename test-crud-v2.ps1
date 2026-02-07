#!/usr/bin/env pwsh
# Test CRUD operations via HTTP - Works with Supabase or SQLite backend

param(
    [string]$BaseUrl = "http://localhost:8888/.netlify/functions",
    [switch]$Production = $false
)

if ($Production) {
    $BaseUrl = "https://YOUR_NETLIFY_URL.netlify.app/.netlify/functions"
    Write-Host "⚠️  PRODUCTION MODE - Update BaseUrl in script or use param" -ForegroundColor Yellow
}

function Test-Endpoint {
    param($Name, $Method, $Endpoint, $Body = $null)
    
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    try {
        $params = @{
            Uri     = "$BaseUrl$Endpoint"
            Method  = $Method
            Headers = @{ "Content-Type" = "application/json" }
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json -Compress
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ Status: 200 OK" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
        return $response
    }
    catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# === RUN TESTS ===

Write-Host "Starting CRUD tests on $BaseUrl`n" -ForegroundColor Yellow

# 1. GET (empty)
Test-Endpoint "1. GET All (empty)" "GET" "/get-attendance"

# 2. POST - Add first record
$record1 = @{ name = "Andi"; timestamp = (Get-Date -AsUTC).ToString("o") }
Test-Endpoint "2. POST Add Andi" "POST" "/add-attendance" $record1

# 3. GET (should show 1 record)
Test-Endpoint "3. GET All (after add)" "GET" "/get-attendance"

# 4. POST - Add second record
$record2 = @{ name = "Budi"; timestamp = (Get-Date -AsUTC).ToString("o") }
Test-Endpoint "4. POST Add Budi" "POST" "/add-attendance" $record2

# 5. GET (should show 2 records)
Test-Endpoint "5. GET All (after 2nd add)" "GET" "/get-attendance"

# 6. PUT - Update first record (assuming id=1)
$update = @{ name = "Andi Wijaya" }
Test-Endpoint "6. PUT Update ID=1" "PUT" "/update-attendance?id=1" $update

# 7. GET (should show updated name)
Test-Endpoint "7. GET All (after update)" "GET" "/get-attendance"

# 8. DELETE - Remove first record
Test-Endpoint "8. DELETE ID=1" "DELETE" "/delete-attendance?id=1"

# 9. GET (should show only 1 record)
Test-Endpoint "9. GET All (after delete)" "GET" "/get-attendance"

Write-Host "`n✅ All tests completed!" -ForegroundColor Green

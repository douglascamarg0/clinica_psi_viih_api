
$baseUrl = "http://localhost:3000"
$email = "testUser_$(Get-Random)@example.com"
$password = "password123"

Write-Host "--- Testing API ---" -ForegroundColor Cyan

# 1. Register
Write-Host "`n1. Testing Register ($email)..."
$registerBody = @{
    name = "Test User"
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Register Response: $($regResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "Register Failed: $_" -ForegroundColor Red
    exit
}

# 2. Login
Write-Host "`n2. Testing Login..."
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.access_token
    if ($token) {
        Write-Host "Login Successful. Token received." -ForegroundColor Green
    } else {
        Write-Host "Login Failed. No token." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
     exit
}

# 3. Protected Route (Get Users)
Write-Host "`n3. Testing Protected Route (GET /users)..."
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers
    if ($usersResponse.status -eq $true) {
        Write-Host "Get Users Successful. Count: $($usersResponse.data.Count)" -ForegroundColor Green
    } else {
        Write-Host "Get Users Failed: $($usersResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Protected Route Failed: $_" -ForegroundColor Red
}

# 4. Unauthorized Access
Write-Host "`n4. Testing Unauthorized Access..."
try {
    $unauthResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
    Write-Host "Unexpected Success (Should have failed)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq "Unauthorized") {
        Write-Host "Success: Request was blocked (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "Failed with unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

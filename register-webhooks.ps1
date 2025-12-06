# PowerShell script to register webhooks

# Configuration
$BACKEND_URL = "https://shopify-analytics-backend-l14y.onrender.com/api"
$TENANT_ID = "66bc6973-ca31-4de3-b61a-0218b7e5624c"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Webhook Registration Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login to get JWT token" -ForegroundColor Yellow
Write-Host "Enter your email: " -NoNewline
$email = Read-Host
Write-Host "Enter your password: " -NoNewline
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$loginBody = @{
    email = $email
    password = $passwordPlain
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $loginResponse.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "If you don't have an account, you can:" -ForegroundColor Yellow
    Write-Host "1. Sign up at: https://shopify-analytics-platform-gamma.vercel.app/" -ForegroundColor Yellow
    Write-Host "2. Or create a test user in Render Shell" -ForegroundColor Yellow
    exit 1
}

# Step 2: Register webhooks
Write-Host "Step 2: Registering webhooks..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $webhookResponse = Invoke-RestMethod -Uri "$BACKEND_URL/tenants/$TENANT_ID/webhooks/register" -Method POST -Headers $headers
    Write-Host "✓ Webhooks registered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    $webhookResponse.results | ForEach-Object {
        Write-Host "  - $($_.topic): $($_.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Webhook registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

param(
    [switch]$SkipTests = $true
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "       Launching QueueCut Platform       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start Backend in a background job or separate window
Write-Host "Starting Spring Boot Backend..." -ForegroundColor Yellow
$ApiDir = Join-Path $PSScriptRoot "apps\api"
if (!(Test-Path $ApiDir)) {
    Write-Error "Backend directory not found at $ApiDir"
    exit 1
}

# Use Start-Process to open a new window for the backend, making it easy to see logs
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$ApiDir'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# 2. Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
$WebDir = Join-Path $PSScriptRoot "apps\web"
if (!(Test-Path $WebDir)) {
    Write-Error "Frontend directory not found at $WebDir"
    exit 1
}

# Run npm dev in the current window
Push-Location $WebDir
try {
    Write-Host "Installing frontend dependencies if needed..."
    npm install
    Write-Host "Starting Vite Dev Server..."
    npm run dev
}
finally {
    Pop-Location
}

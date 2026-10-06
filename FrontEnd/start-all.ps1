# start-all.ps1

Write-Host "Checking for Node.js..." -ForegroundColor Cyan
if ((Get-Command "node" -ErrorAction SilentlyContinue) -eq $null) {
    Write-Host "Node.js is NOT installed! Please download and install it from https://nodejs.org/" -ForegroundColor Red
    Write-Host "After installing, please close and reopen your terminal/VS Code, then run this script again." -ForegroundColor Yellow
    Exit
}

Write-Host "Node.js is installed. Starting CodeVerse 2026..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm install; npm start`""

# Start Home Page
Write-Host "Starting Home Page..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'Home page'; npm install; npm run dev`""

# Start Team Registration
Write-Host "Starting Team Registration..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'Team registartion'; npm install; npm run dev`""

# Start Payment App
Write-Host "Starting Payment App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd Payment; npm install; npm run dev`""

Write-Host "All services are starting up! Check the newly opened terminal windows for the local URLs." -ForegroundColor Green
Write-Host "Usually, Home page will be on http://localhost:5173" -ForegroundColor Cyan

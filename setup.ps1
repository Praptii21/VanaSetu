Write-Host "Starting VenaSetu Environment Setup..." -ForegroundColor Cyan

# 1. Install Python Backend Requirements
Write-Host "Installing Python requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# 2. Install Frontend Dependencies
Write-Host "Installing Frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

Write-Host "Setup Complete! To start development:" -ForegroundColor Green
Write-Host 'Backend: cd backend; uvicorn main:app --reload'
Write-Host 'Frontend: cd frontend; npm run dev'

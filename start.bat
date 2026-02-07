@echo off
echo ========================================
echo SafeMom - Starting Server and Frontend
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

echo.
echo Starting server on port 3001...
start "SafeMom Server" cmd /k "cd server && npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend on port 5173...
start "SafeMom Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both server and frontend are starting!
echo ========================================
echo Server: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop both servers...
pause >nul

taskkill /FI "WindowTitle eq SafeMom Server*" /T /F
taskkill /FI "WindowTitle eq SafeMom Frontend*" /T /F

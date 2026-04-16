@echo off
title AI Director - Startup Script

:: 1. Check Node.js environment
echo [*] Checking Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit
)

:: 2. Check node_modules folder
if not exist node_modules (
    echo [!] node_modules folder is missing.
    goto :install
)

:: 3. Verify dependency integrity
echo [*] Verifying dependencies...
call npm list --depth=0 >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Dependencies are incomplete or outdated.
    set /p choice=Would you like to repair/install dependencies? (Y/N): 
    if /i "%choice%"=="Y" goto :install
)

:start_app
echo.
echo [*] Starting Application (npm run dev)...
echo ==========================================
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [X] Application crashed or stopped unexpectedly.
    pause
)
exit

:install
echo.
echo [*] Installing dependencies, this may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [X] npm install failed. Please check your internet connection.
    pause
    exit
)
echo [OK] Installation successful.
goto :start_app

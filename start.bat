@echo off
setlocal enabledelayedexpansion
title AI Director - Startup Script

:: 1. Check Node.js environment
echo [*] Checking Node.js environment...
node -v >nul 2>&1
if !errorlevel! neq 0 (
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
:: We check for a key file (vite) which is faster and more reliable than 'npm list'
if not exist "node_modules\.bin\vite" (
    echo [!] Dependencies appear to be incomplete.
    goto :prompt_install
)

:: Optional: You can still use npm list but it's slow. 
:: Let's stick to the fast check for a better user experience.
echo [OK] Dependencies verified.
goto :start_app

:prompt_install
set /p choice=Would you like to repair/install dependencies? (Y/N): 
if /i "!choice!"=="Y" goto :install
goto :start_app

:install
echo.
echo [*] Installing dependencies, this may take a few minutes...
call npm install
if !errorlevel! neq 0 (
    echo.
    echo [X] npm install failed. Please check your internet connection.
    pause
    exit
)
echo [OK] Installation successful.
goto :start_app

:start_app
echo.
echo [*] Starting Application (npm run dev)...
echo ==========================================
call npm run dev
if !errorlevel! neq 0 (
    echo.
    echo [X] Application crashed or stopped unexpectedly.
    pause
)
:: Keep window open if dev server stops
echo.
echo Press any key to exit...
pause >nul
exit

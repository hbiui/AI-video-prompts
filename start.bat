@echo off
:: Set code page to UTF-8 to support potential special characters, 
:: though we use English here to ensure maximum compatibility across different Windows locales.
chcp 65001 >nul
setlocal enabledelayedexpansion
title AI Director - Startup Script

echo ==========================================
echo    AI Director - Environment Check
echo ==========================================
echo.

set NEED_INSTALL=0

:: 1. Check if node_modules folder exists
if not exist node_modules (
    echo [!] node_modules folder not found.
    set NEED_INSTALL=1
) else (
    echo [*] Checking dependency integrity...
    :: Check if dependencies are missing or outdated
    call npm list --depth=0 >nul 2>&1
    if !errorlevel! neq 0 (
        echo [!] Dependencies are missing or need update.
        set NEED_INSTALL=1
    ) else (
        echo [OK] Dependencies are healthy.
    )
)

:: 2. Prompt for installation if needed
if %NEED_INSTALL%==1 (
    echo.
    set /p choice="Dependencies are missing. Install now? (Y/N): "
    if /i "!choice!"=="Y" (
        echo [*] Running npm install, please wait...
        call npm install
        if !errorlevel! neq 0 (
            echo.
            echo [X] Installation failed. Please check your network or Node.js environment.
            pause
            exit /b 1
        )
        echo [OK] Installation complete.
    ) else (
        echo [!] Installation skipped. The app may fail to start.
    )
)

echo.
echo [*] Starting dev server (npm run dev)...
echo ==========================================
echo.

:: 3. Start the application
call npm run dev

if !errorlevel! neq 0 (
    echo.
    echo [X] Application exited with an error.
)

pause

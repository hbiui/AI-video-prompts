@echo off
setlocal enabledelayedexpansion
title AI Director - 一键启动脚本

echo ==========================================
echo    AI Director - 环境检查与启动
echo ==========================================
echo.

set NEED_INSTALL=0

:: 1. 检查 node_modules 文件夹是否存在
if not exist node_modules (
    echo [!] 检测到尚未安装依赖环境 (node_modules 未找到)。
    set NEED_INSTALL=1
) else (
    echo [*] 正在检查依赖完整性...
    :: 2. 使用 npm list 检查是否有缺失或错误的依赖
    call npm list --depth=0 >nul 2>&1
    if !errorlevel! neq 0 (
        echo [!] 检测到依赖环境不全或版本不匹配。
        set NEED_INSTALL=1
    ) else (
        echo [OK] 依赖环境检查通过。
    )
)

:: 3. 如果需要安装或更新
if %NEED_INSTALL%==1 (
    echo.
    set /p choice="是否现在安装/补全依赖环境? (Y/N): "
    if /i "!choice!"=="Y" (
        echo [*] 正在执行 npm install，请稍候...
        call npm install
        if !errorlevel! neq 0 (
            echo.
            echo [X] 依赖安装失败，请检查网络或 Node.js 环境。
            pause
            exit /b 1
        )
        echo [OK] 依赖安装完成。
    ) else (
        echo [!] 已跳过安装，程序可能无法正常运行。
    )
)

echo.
echo [*] 正在启动开发服务器 (npm run dev)...
echo ==========================================
echo.

:: 4. 启动程序
call npm run dev

if !errorlevel! neq 0 (
    echo.
    echo [X] 程序异常退出。
)

pause

@echo off
chcp 65001 > nul
setlocal

:: 관리자 권한 확인 및 자동 상승
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [안내] 인증서를 Windows 시스템 신뢰할 수 있는 루트 기관에 등록하기 위해 관리자 권한을 요청합니다...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~dp0setup-code-signing.bat\"\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0\.."

node scripts\setup-code-signing.cjs

echo.
pause

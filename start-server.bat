@echo off
REM start-server.bat — Inicia servidor PHP local no Windows

setlocal enabledelayedexpansion
set PORT=8000

echo.
echo ==========================================
echo  Iniciando servidor PHP...
echo ==========================================
echo.
echo 🚀 Porta: %PORT%
echo 📝 Acesse: http://localhost:%PORT%
echo 🔗 API PIX: http://localhost:%PORT%/api/zuckpay_pix.php
echo.
echo Pressione Ctrl+C para parar
echo.

php -S localhost:%PORT%

pause

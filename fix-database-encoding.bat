@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   SỬA ENCODING DATABASE - FIX FONT CHỮ
echo ═══════════════════════════════════════════════════════
echo.

echo [1/4] Đang kiểm tra container...
docker ps --format "{{.Names}}" | findstr /i "postgres" >nul
if %errorlevel% neq 0 (
    echo ❌ Không tìm thấy container postgres!
    pause
    exit /b 1
)

echo ✓ Container đang chạy
echo.

echo [2/4] Đang kiểm tra encoding database hiện tại...
docker exec 9carat-postgres-dev psql -U postgres -d carat9_reward -c "SHOW server_encoding;" 2>nul
echo.

echo [3/4] Đang set encoding UTF-8 cho database...
docker exec 9carat-postgres-dev psql -U postgres -d carat9_reward -c "UPDATE pg_database SET encoding = pg_char_to_encoding('UTF8') WHERE datname = 'carat9_reward';" 2>nul
echo.

echo [4/4] Đang set client encoding...
docker exec 9carat-postgres-dev psql -U postgres -d carat9_reward -c "SET client_encoding = 'UTF8';" 2>nul
echo.

echo ═══════════════════════════════════════════════════════
echo   HOÀN TẤT!
echo ═══════════════════════════════════════════════════════
echo.
echo 📝 Lưu ý:
echo    - Nếu vẫn lỗi font, cần tạo lại database với UTF-8
echo    - Hoặc import lại dữ liệu với encoding đúng
echo.
pause



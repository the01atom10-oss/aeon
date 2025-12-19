@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   EXPORT DATABASE - TẠO FILE BACKUP MỚI
echo ═══════════════════════════════════════════════════════
echo.

echo [1/3] Đang kiểm tra container...
docker ps --format "{{.Names}}" | findstr /i "postgres" >nul
if %errorlevel% neq 0 (
    echo ❌ Không tìm thấy container postgres!
    echo    Vui lòng khởi động database trước.
    pause
    exit /b 1
)

echo ✓ Container đang chạy
echo.

echo [2/3] Đang kiểm tra database...
docker exec aeon-postgres-dev psql -U postgres -l 2>nul | findstr /i "aeon_reward" >nul
if %errorlevel% neq 0 (
    echo ❌ Không tìm thấy database aeon_reward!
    echo    Kiểm tra tên database: docker exec aeon-postgres-dev psql -U postgres -l
    pause
    exit /b 1
)

echo ✓ Database aeon_reward tồn tại
echo.

echo [3/3] Đang export database với encoding UTF-8...
docker exec aeon-postgres-dev pg_dump -U postgres aeon_reward --encoding=UTF8 --no-owner --no-acl > database_backup_new.sql 2>export_error.log

if %errorlevel% neq 0 (
    echo ❌ Lỗi khi export!
    type export_error.log
    pause
    exit /b 1
)

echo ✓ Đã tạo file: database_backup_new.sql
echo.

for %%A in (database_backup_new.sql) do set size=%%~zA
set /a sizeMB=%size%/1048576
echo    Kích thước: %sizeMB% MB
echo.

echo ═══════════════════════════════════════════════════════
echo   HOÀN TẤT!
echo ═══════════════════════════════════════════════════════
echo.
echo 📦 File backup: database_backup_new.sql
echo    File này đã được encode UTF-8, sẵn sàng để import!
echo.
pause



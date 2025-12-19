@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   TẠO LẠI DATABASE VỚI UTF-8 ENCODING
echo ═══════════════════════════════════════════════════════
echo.
echo ⚠️  CẢNH BÁO: Thao tác này sẽ XÓA toàn bộ dữ liệu!
echo    Chỉ chạy nếu đã có file backup!
echo.
set /p confirm="Bạn có chắc chắn? (YES để tiếp tục): "
if not "%confirm%"=="YES" (
    echo Đã hủy.
    pause
    exit /b 0
)

echo.
echo [1/5] Đang export dữ liệu hiện tại...
docker exec 9carat-postgres-dev pg_dump -U postgres carat9_reward --encoding=UTF8 --no-owner --no-acl > temp_backup.sql 2>nul
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi export! Kiểm tra container và database.
    pause
    exit /b 1
)
echo ✓ Đã export dữ liệu
echo.

echo [2/5] Đang xóa database cũ...
docker exec 9carat-postgres-dev psql -U postgres -c "DROP DATABASE carat9_reward;" 2>nul
echo ✓ Đã xóa database cũ
echo.

echo [3/5] Đang tạo database mới với UTF-8...
docker exec 9carat-postgres-dev psql -U postgres -c "CREATE DATABASE carat9_reward WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE template0;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi tạo database!
    pause
    exit /b 1
)
echo ✓ Đã tạo database mới với UTF-8
echo.

echo [4/5] Đang import lại dữ liệu...
type temp_backup.sql | docker exec -i 9carat-postgres-dev psql -U postgres carat9_reward >import_log.txt 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Có lỗi khi import, kiểm tra import_log.txt
) else (
    echo ✓ Đã import dữ liệu
)
echo.

echo [5/5] Đang kiểm tra encoding...
docker exec 9carat-postgres-dev psql -U postgres -d carat9_reward -c "SHOW server_encoding;" 2>nul
echo.

echo ═══════════════════════════════════════════════════════
echo   HOÀN TẤT!
echo ═══════════════════════════════════════════════════════
echo.
echo 📝 Bước tiếp theo:
echo    1. npx prisma generate
echo    2. npm run dev
echo.
pause



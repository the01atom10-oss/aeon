@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   IMPORT DATABASE - TRÊN MÁY MỚI
echo ═══════════════════════════════════════════════════════
echo.

echo [1/5] Đang kiểm tra container...
docker ps --format "{{.Names}}" | findstr /i "postgres" >nul
if %errorlevel% neq 0 (
    echo ❌ Không tìm thấy container postgres!
    echo    Đang khởi động database...
    docker-compose -f docker-compose.db-only.yml up -d
    timeout /t 10 /nobreak >nul
)

echo ✓ Container đang chạy
echo.

echo [2/5] Đang kiểm tra file backup...
if not exist "database_backup_new.sql" (
    echo ❌ File database_backup_new.sql không tồn tại!
    echo    Vui lòng đảm bảo file có trong thư mục project.
    pause
    exit /b 1
)

echo ✓ File backup tồn tại
echo.

echo [3/5] Đang xóa database cũ (nếu có)...
docker exec 9carat-postgres-dev psql -U postgres -c "DROP DATABASE IF EXISTS carat9_reward;" 2>nul
docker exec 9carat-postgres-dev psql -U postgres -c "DROP DATABASE IF EXISTS aeon_reward;" 2>nul
echo ✓ Đã xóa database cũ
echo.

echo [4/5] Đang tạo database mới...
docker exec 9carat-postgres-dev psql -U postgres -c "CREATE DATABASE carat9_reward;" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Database đã tồn tại, bỏ qua...
) else (
    echo ✓ Đã tạo database carat9_reward
)
echo.

echo [5/5] Đang import dữ liệu...
echo    (Quá trình này có thể mất 1-2 phút...)
echo.

type database_backup_new.sql | docker exec -i 9carat-postgres-dev psql -U postgres carat9_reward >import_log.txt 2>&1

if %errorlevel% neq 0 (
    echo ❌ Có lỗi khi import!
    echo    Kiểm tra file import_log.txt để xem chi tiết.
    echo.
    echo    Thử cách khác: docker exec -i 9carat-postgres-dev psql -U postgres carat9_reward -f /tmp/backup.sql
    pause
    exit /b 1
)

echo ✓ Import hoàn tất!
echo.

echo [6/6] Đang kiểm tra dữ liệu...
docker exec 9carat-postgres-dev psql -U postgres -d carat9_reward -c "SELECT COUNT(*) as user_count FROM \"User\";" 2>nul
echo.

echo ═══════════════════════════════════════════════════════
echo   HOÀN TẤT!
echo ═══════════════════════════════════════════════════════
echo.
echo ✅ Database đã được import thành công!
echo.
echo 📝 Bước tiếp theo:
echo    1. npx prisma generate
echo    2. npm run dev
echo.
pause


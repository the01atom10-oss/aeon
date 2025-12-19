@echo off
chcp 65001 >nul
echo ========================================
echo    9CARAT - Khởi động ứng dụng
echo ========================================
echo.

REM Kiểm tra Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker chưa được cài đặt!
    echo Vui lòng cài Docker Desktop từ: https://www.docker.com/
    pause
    exit /b 1
)

echo ✅ Docker đã cài đặt
echo.

REM Hỏi người dùng muốn chạy cách nào
echo Chọn cách chạy:
echo 1. Chạy toàn bộ trên Docker (Khuyến nghị)
echo 2. Chỉ chạy Database trên Docker, App chạy local
echo.
set /p choice="Nhập lựa chọn (1 hoặc 2): "

if "%choice%"=="1" goto :docker_all
if "%choice%"=="2" goto :docker_db
echo ❌ Lựa chọn không hợp lệ!
pause
exit /b 1

:docker_all
echo.
echo ========================================
echo   Chạy toàn bộ trên Docker
echo ========================================
echo.
echo [1/3] Dừng container cũ (nếu có)...
docker-compose down >nul 2>&1

echo [2/3] Build và khởi động containers...
docker-compose up -d --build

echo [3/3] Đợi ứng dụng khởi động (30 giây)...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   ✅ Khởi động thành công!
echo ========================================
echo.
echo Truy cập: http://localhost:3000
echo.
echo Để xem logs:
echo   docker-compose logs -f
echo.
echo Để dừng:
echo   docker-compose down
echo.
pause
exit /b 0

:docker_db
echo.
echo ========================================
echo   Chỉ chạy Database trên Docker
echo ========================================
echo.

REM Kiểm tra Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt!
    echo Vui lòng cài Node.js từ: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js đã cài đặt

REM Kiểm tra node_modules
if not exist "node_modules" (
    echo.
    echo [1/5] Cài đặt dependencies (chỉ lần đầu)...
    call npm install
    if errorlevel 1 (
        echo ❌ Cài đặt thất bại!
        pause
        exit /b 1
    )
) else (
    echo [1/5] Dependencies đã có sẵn
)

echo [2/5] Khởi động database...
docker-compose -f docker-compose.db-only.yml up -d

echo [3/5] Đợi database khởi động (15 giây)...
timeout /t 15 /nobreak >nul

echo [4/5] Generate Prisma Client...
call npx prisma generate >nul

echo [5/8] Push database schema...
call npx prisma db push --accept-data-loss

echo [6/8] Seed VIP levels...
call npx tsx prisma/seed-vip-levels.ts

echo [7/8] Seed tasks data...
call npx tsx prisma/seed-tasks.ts

echo [8/8] Seed demo accounts...
call npx tsx prisma/seed-users.ts

echo.
echo ========================================
echo   ✅ Database đã sẵn sàng!
echo ========================================
echo.
echo ═══════════════════════════════════════
echo   DEMO ACCOUNTS CREATED!
echo ═══════════════════════════════════════
echo.
echo 👤 ADMIN:
echo    Username: admin
echo    Password: Admin@123
echo    Balance: $10,000
echo.
echo 👤 USER:
echo    Username: demo  
echo    Password: Demo@123
echo    Balance: $1,000
echo.
echo ═══════════════════════════════════════
echo.
echo Bây giờ chạy app:
echo   npm run dev
echo.
echo Sau đó truy cập: http://localhost:3000/login
echo.
pause
exit /b 0


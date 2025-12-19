@echo off
echo ====================================
echo Sua loi Docker - localhost:3000 khong len
echo ====================================
echo.

echo [1] Dung tat ca containers...
docker-compose down
echo.

echo [2] Xem logs cuoi cung cua web container (neu co)...
docker-compose logs --tail=20 web 2>nul
echo.

echo [3] Kiem tra file .env...
if exist .env (
    echo ✅ File .env ton tai
    echo.
    echo Noi dung NEXTAUTH_SECRET:
    findstr "NEXTAUTH_SECRET" .env 2>nul || echo ⚠️ NEXTAUTH_SECRET chua duoc cau hinh
) else (
    echo ⚠️ File .env khong ton tai
    echo.
    echo Tao file .env...
    (
        echo NEXTAUTH_SECRET=development-secret-change-in-production
        echo NEXTAUTH_URL=http://localhost:3000
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    ) > .env
    echo ✅ Da tao file .env
)
echo.

echo [4] Build lai Docker images (co the mat 5-10 phut)...
echo ⏳ Dang build...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ❌ Build that bai! Xem loi o tren.
    pause
    exit /b 1
)

echo.
echo ✅ Build thanh cong!
echo.

echo [5] Khoi dong containers...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Loi khi khoi dong containers!
    pause
    exit /b 1
)

echo.
echo [6] Cho 10 giay de containers khoi dong...
timeout /t 10 /nobreak >nul

echo.
echo [7] Kiem tra containers...
docker ps
echo.

echo [8] Xem logs web container...
echo ====================================
docker-compose logs --tail=30 web
echo ====================================
echo.

echo [9] Kiem tra port 3000...
netstat -an | findstr :3000
if %errorlevel% == 0 (
    echo ✅ Port 3000 dang duoc su dung
) else (
    echo ⚠️ Port 3000 chua co process nao
)
echo.

echo [10] Kiem tra database...
docker-compose exec -T db pg_isready -U postgres 2>nul
if %errorlevel% == 0 (
    echo ✅ Database san sang
) else (
    echo ❌ Database chua san sang
)
echo.

echo ====================================
echo Neu van khong len, thu:
echo   1. Xem logs chi tiet: docker-compose logs -f web
echo   2. Kiem tra container: docker ps
echo   3. Vao trong container: docker-compose exec web sh
echo ====================================
echo.

pause


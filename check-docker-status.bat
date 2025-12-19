@echo off
echo ====================================
echo Kiem tra trang thai Docker
echo ====================================
echo.

echo [1] Kiem tra containers dang chay...
docker ps
echo.

echo [2] Kiem tra container aeon-web...
docker ps | findstr aeon-web
if %errorlevel% neq 0 (
    echo ❌ Container aeon-web KHONG chay!
    echo.
    echo Kiem tra container da tao chua:
    docker ps -a | findstr aeon-web
    echo.
    echo Neu container ton tai nhung khong chay, thu:
    echo   docker-compose up -d
) else (
    echo ✅ Container aeon-web dang chay
)
echo.

echo [3] Kiem tra container aeon-postgres...
docker ps | findstr aeon-postgres
if %errorlevel% neq 0 (
    echo ❌ Container aeon-postgres KHONG chay!
) else (
    echo ✅ Container aeon-postgres dang chay
)
echo.

echo [4] Kiem tra port 3000...
netstat -an | findstr :3000
if %errorlevel% == 0 (
    echo ✅ Port 3000 dang duoc su dung
) else (
    echo ⚠️ Port 3000 khong co process nao dang dung
)
echo.

echo [5] Xem logs cua web container (10 dong cuoi)...
echo ----------------------------------------
docker-compose logs --tail=10 web
echo ----------------------------------------
echo.

echo [6] Kiem tra database connection...
docker-compose exec -T db pg_isready -U postgres 2>nul
if %errorlevel% == 0 (
    echo ✅ Database san sang
) else (
    echo ❌ Database chua san sang hoac khong ket noi duoc
)
echo.

pause


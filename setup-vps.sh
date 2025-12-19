#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "   SETUP 9CARAT TRÊN VPS UBUNTU"
echo "═══════════════════════════════════════════════════════"
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Không chạy script với root! Dùng user thường với sudo.${NC}"
   exit 1
fi

echo "[1/8] Cập nhật system..."
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✓ Hoàn tất${NC}"
echo

echo "[2/8] Cài đặt Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker đã cài đặt${NC}"
    echo -e "${YELLOW}⚠️  Cần logout và login lại để áp dụng docker group${NC}"
else
    echo -e "${GREEN}✓ Docker đã có sẵn${NC}"
fi
echo

echo "[3/8] Cài đặt Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose đã cài đặt${NC}"
else
    echo -e "${GREEN}✓ Docker Compose đã có sẵn${NC}"
fi
echo

echo "[4/8] Cài đặt Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js đã cài đặt${NC}"
else
    echo -e "${GREEN}✓ Node.js đã có sẵn: $(node --version)${NC}"
fi
echo

echo "[5/8] Cài đặt PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 đã cài đặt${NC}"
else
    echo -e "${GREEN}✓ PM2 đã có sẵn${NC}"
fi
echo

echo "[6/8] Kiểm tra project folder..."
if [ ! -d "aeon" ]; then
    echo -e "${YELLOW}⚠️  Thư mục 'aeon' không tồn tại!${NC}"
    echo "   Vui lòng upload project vào thư mục hiện tại"
    exit 1
fi
cd aeon
echo -e "${GREEN}✓ Đã vào thư mục project${NC}"
echo

echo "[7/8] Cài đặt dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi cài dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies đã cài đặt${NC}"
echo

echo "[8/8] Khởi động database và adminer..."
docker-compose -f docker-compose.vps.yml up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi khởi động Docker!${NC}"
    exit 1
fi

echo "Đợi 15 giây để database khởi động..."
sleep 15
echo -e "${GREEN}✓ Database đã khởi động${NC}"
echo

echo "═══════════════════════════════════════════════════════"
echo "   HOÀN TẤT CÀI ĐẶT!"
echo "═══════════════════════════════════════════════════════"
echo
echo "📝 BƯỚC TIẾP THEO:"
echo "   1. Tạo file .env.local với DATABASE_URL"
echo "   2. npx prisma generate"
echo "   3. npx prisma db push --accept-data-loss"
echo "   4. npx tsx prisma/seed-vip-levels.ts"
echo "   5. npx tsx prisma/seed-tasks.ts"
echo "   6. npx tsx prisma/seed-users.ts"
echo "   7. npm run build"
echo "   8. pm2 start npm --name '9carat' -- start"
echo
echo "🔗 TRUY CẬP:"
echo "   - App: http://$(hostname -I | awk '{print $1}'):3000"
echo "   - Adminer: http://localhost:8080 (dùng SSH tunnel)"
echo
echo "🔒 BẢO MẬT:"
echo "   - Đổi mật khẩu database trong docker-compose.vps.yml"
echo "   - Tạo NEXTAUTH_SECRET mạnh trong .env.local"
echo "   - Cấu hình firewall (ufw)"
echo



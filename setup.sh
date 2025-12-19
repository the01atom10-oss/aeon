#!/bin/bash

echo "========================================"
echo "  AEON Reward Platform - Auto Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "[1/8] Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js chưa được cài đặt!${NC}"
    echo "Vui lòng tải và cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js đã cài đặt${NC}"

# Check Docker
echo "[2/8] Kiểm tra Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker chưa được cài đặt!${NC}"
    echo "Vui lòng tải và cài đặt Docker từ: https://www.docker.com/"
    exit 1
fi
echo -e "${GREEN}✅ Docker đã cài đặt${NC}"

# Install dependencies
echo ""
echo "[3/8] Cài đặt dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cài đặt dependencies thất bại!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies đã cài đặt${NC}"

# Create .env.local
echo ""
echo "[4/8] Tạo file .env.local..."
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  File .env.local đã tồn tại, bỏ qua...${NC}"
else
    cp .env.example .env.local
    echo -e "${GREEN}✅ Đã tạo .env.local từ .env.example${NC}"
    echo -e "${YELLOW}📝 Nhớ chỉnh sửa .env.local nếu cần!${NC}"
fi

# Start database
echo ""
echo "[5/8] Khởi động database (Docker)..."
docker-compose -f docker-compose.db-only.yml down &> /dev/null
docker-compose -f docker-compose.db-only.yml up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Không thể khởi động database!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database đã khởi động${NC}"

# Wait for database
echo ""
echo "[6/8] Đợi database khởi động (15 giây)..."
sleep 15
echo -e "${GREEN}✅ Database sẵn sàng${NC}"

# Generate Prisma Client
echo ""
echo "[7/8] Generate Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Generate Prisma Client thất bại!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client đã generate${NC}"

# Push database schema
echo ""
echo "[8/8] Push database schema..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Push schema thất bại!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database schema đã được tạo${NC}"

echo ""
echo "========================================"
echo -e "       ${GREEN}🎉 Setup hoàn tất!${NC}"
echo "========================================"
echo ""
echo "📝 Các bước tiếp theo:"
echo ""
echo "1. Chỉnh sửa .env.local nếu cần (đặc biệt là NEXTAUTH_SECRET)"
echo "2. Chạy: npm run dev"
echo "3. Truy cập: http://localhost:3000"
echo "4. Tạo tài khoản admin đầu tiên"
echo ""
echo "💡 Mẹo:"
echo "  - Xem database: npx prisma studio"
echo "  - Xem logs: docker-compose -f docker-compose.db-only.yml logs -f"
echo "  - Dừng database: docker-compose -f docker-compose.db-only.yml down"
echo ""


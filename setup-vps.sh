#!/bin/bash
# ============================================
# Script Setup VPS cho 9Carat
# ============================================

set -e  # Exit on error

echo "🚀 Bắt đầu setup VPS cho 9Carat..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Không chạy script này với quyền root${NC}"
   exit 1
fi

# Step 1: Check Docker
echo -e "${YELLOW}📦 Kiểm tra Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker trước.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker đã được cài đặt${NC}"

# Step 2: Check Node.js (for seeding)
echo -e "${YELLOW}📦 Kiểm tra Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js chưa được cài đặt. Sẽ bỏ qua bước seed database.${NC}"
    SKIP_SEED=true
else
    echo -e "${GREEN}✅ Node.js đã được cài đặt${NC}"
    SKIP_SEED=false
fi

# Step 3: Check .env file
echo -e "${YELLOW}📝 Kiểm tra file .env...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.vps ]; then
        echo -e "${YELLOW}⚠️  File .env chưa tồn tại. Tạo từ .env.vps...${NC}"
        cp .env.vps .env
        echo -e "${GREEN}✅ Đã tạo file .env từ .env.vps${NC}"
        echo -e "${YELLOW}⚠️  Vui lòng kiểm tra và cập nhật file .env trước khi tiếp tục!${NC}"
        read -p "Nhấn Enter để tiếp tục sau khi đã cập nhật .env..."
    else
        echo -e "${RED}❌ Không tìm thấy file .env hoặc .env.vps${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ File .env đã tồn tại${NC}"
fi

# Step 4: Start database
echo -e "${YELLOW}🗄️  Khởi động database...${NC}"
docker-compose -f docker-compose.vps.yml up -d db

# Wait for database to be ready
echo -e "${YELLOW}⏳ Đợi database sẵn sàng...${NC}"
sleep 10

# Step 5: Run migrations
echo -e "${YELLOW}🔄 Chạy database migrations...${NC}"
if [ "$SKIP_SEED" = false ]; then
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Cài đặt dependencies...${NC}"
        npm install
    fi
    
    # Generate Prisma Client
    echo -e "${YELLOW}🔧 Generate Prisma Client...${NC}"
    npx prisma generate
    
    # Run migrations
    echo -e "${YELLOW}🔄 Apply migrations...${NC}"
    npx prisma migrate deploy
    
    # Seed database
    echo -e "${YELLOW}🌱 Seed database...${NC}"
    npm run db:seed:all || echo -e "${YELLOW}⚠️  Seed database có thể đã được chạy trước đó${NC}"
else
    echo -e "${YELLOW}⚠️  Bỏ qua migrations và seed (cần Node.js)${NC}"
    echo -e "${YELLOW}⚠️  Vui lòng chạy thủ công:${NC}"
    echo -e "   npm install"
    echo -e "   npx prisma generate"
    echo -e "   npx prisma migrate deploy"
    echo -e "   npm run db:seed:all"
fi

# Step 6: Build and start application
echo -e "${YELLOW}🏗️  Build và khởi động ứng dụng...${NC}"
docker-compose -f docker-compose.vps.yml up -d --build

# Step 7: Check status
echo -e "${YELLOW}📊 Kiểm tra trạng thái containers...${NC}"
docker-compose -f docker-compose.vps.yml ps

echo -e "${GREEN}✅ Setup hoàn tất!${NC}"
echo -e "${GREEN}🌐 Ứng dụng đang chạy tại: http://localhost:3000${NC}"
echo -e "${GREEN}📊 Adminer tại: http://localhost:8080 (chỉ localhost)${NC}"

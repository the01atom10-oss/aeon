#!/bin/bash
# ============================================
# Script Setup Database trên VPS
# ============================================

set -e  # Exit on error

echo "🗄️  Bắt đầu setup database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js trước.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env không tồn tại. Vui lòng tạo file .env trước.${NC}"
    exit 1
fi

# Check if database is running
echo -e "${YELLOW}🔍 Kiểm tra database container...${NC}"
if ! docker ps | grep -q "9carat-postgres"; then
    echo -e "${YELLOW}⚠️  Database container chưa chạy. Khởi động database...${NC}"
    docker-compose -f docker-compose.vps.yml up -d db
    echo -e "${YELLOW}⏳ Đợi database sẵn sàng...${NC}"
    sleep 10
fi

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

echo -e "${GREEN}✅ Setup database hoàn tất!${NC}"


#!/bin/bash
# ============================================
# Script Deploy VPS cho 9Carat
# ============================================

set -e  # Exit on error

echo "🚀 Bắt đầu deploy 9Carat lên VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env không tồn tại. Vui lòng tạo file .env trước.${NC}"
    exit 1
fi

# Pull latest code (if using git)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pull latest code...${NC}"
    git pull || echo -e "${YELLOW}⚠️  Không thể pull code (có thể không phải git repo)${NC}"
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Dừng containers hiện tại...${NC}"
docker-compose -f docker-compose.vps.yml down

# Build and start
echo -e "${YELLOW}🏗️  Build và khởi động ứng dụng...${NC}"
docker-compose -f docker-compose.vps.yml up -d --build

# Wait for containers to be ready
echo -e "${YELLOW}⏳ Đợi containers sẵn sàng...${NC}"
sleep 10

# Check status
echo -e "${YELLOW}📊 Kiểm tra trạng thái containers...${NC}"
docker-compose -f docker-compose.vps.yml ps

# Show logs
echo -e "${YELLOW}📋 Logs của web container (Ctrl+C để thoát):${NC}"
docker-compose -f docker-compose.vps.yml logs -f web


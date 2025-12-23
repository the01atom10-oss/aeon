# 🚀 Hướng Dẫn Deploy 9Carat lên VPS

## 📋 Yêu Cầu Hệ Thống

- **OS**: Ubuntu 20.04+ hoặc Debian 11+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Domain**: `9caratonline.com` (hoặc domain của bạn)

---

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1. Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Cài đặt Docker và Docker Compose

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra cài đặt
docker --version
docker-compose --version
```

### 1.3. Cài đặt Node.js (nếu cần chạy script seed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📦 Bước 2: Clone Project

```bash
# Tạo thư mục project
mkdir -p ~/projects
cd ~/projects

# Clone repository (thay URL bằng repo của bạn)
git clone <your-repo-url> aeon
cd aeon
```

---

## 🔐 Bước 3: Cấu Hình Environment Variables

### 3.1. Tạo file `.env`

```bash
nano .env
```

### 3.2. Nội dung file `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:9Carataloonline.@db:5432/carat9_reward?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="C7qY3kvsK+05MeDL1zSQnvQz7ZvOVNwZWyXDMt7VeO0="
NEXTAUTH_URL="https://9caratonline.com"

# Public Base URL
NEXT_PUBLIC_BASE_URL="https://9caratonline.com"
NEXT_PUBLIC_APP_URL="https://9caratonline.com"

# Node Environment
NODE_ENV="production"

# Supabase Configuration (cho upload ảnh)
NEXT_PUBLIC_SUPABASE_URL="https://cwqlafntqzwiqydxgust.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_s3V_MgquuQHdDtDrlHsdnQ_EcVUeH99"
```

**⚠️ Lưu ý:**
- Thay `9caratonline.com` bằng domain của bạn
- Thay `NEXTAUTH_SECRET` bằng secret key mạnh (generate: `openssl rand -base64 32`)
- Thay Supabase credentials bằng credentials của bạn

---

## 🗄️ Bước 4: Setup Database

### 4.1. Khởi động database container

```bash
# Sử dụng docker-compose.vps.yml
docker-compose -f docker-compose.vps.yml up -d db

# Đợi database sẵn sàng (khoảng 10-15 giây)
sleep 15
```

### 4.2. Setup Prisma và Database Schema

```bash
# Generate Prisma Client
npm install
npx prisma generate

# Push schema lên database
npx prisma db push

# Seed dữ liệu ban đầu (VIP levels, Admin user)
npm run db:seed:all
```

**Kết quả mong đợi:**
- ✅ VIP Levels được tạo (ĐỒNG, BẠC, VÀNG, BẠCH KIM, KIM CƯƠNG, PREMIUM VIP)
- ✅ Admin user được tạo:
  - Username: `admin`
  - Password: `Admin@12345`
  - Admin Level: `LEVEL_1` (Toàn quyền)

---

## ☁️ Bước 5: Setup Supabase Storage (Cho Upload Ảnh)

### 5.1. Tạo Supabase Project

1. Truy cập [https://supabase.com](https://supabase.com)
2. Tạo project mới
3. Lấy `Project URL` và `anon key` từ Settings > API

### 5.2. Tạo Storage Bucket

1. Vào **Storage** trong Supabase Dashboard
2. Tạo bucket mới tên `products`
3. Chọn **Public bucket** (cho phép public access)

### 5.3. Setup Storage Policies

Chạy SQL script trong Supabase SQL Editor:

```sql
-- File: SUPABASE_STORAGE_POLICIES_PUBLIC.sql
-- Cho phép public upload, read, update, delete trên bucket 'products'
```

Hoặc tạo policies qua UI:
- **INSERT**: Public, bucket = 'products'
- **SELECT**: Public, bucket = 'products'
- **UPDATE**: Public, bucket = 'products'
- **DELETE**: Public, bucket = 'products'

### 5.4. Cập nhật `.env` với Supabase credentials

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 🐳 Bước 6: Build và Deploy Application

### 6.1. Build Docker image

```bash
docker-compose -f docker-compose.vps.yml build
```

### 6.2. Khởi động tất cả services

```bash
docker-compose -f docker-compose.vps.yml up -d
```

### 6.3. Kiểm tra logs

```bash
# Xem logs của web service
docker-compose -f docker-compose.vps.yml logs -f web

# Xem logs của database
docker-compose -f docker-compose.vps.yml logs -f db
```

---

## 🌐 Bước 7: Setup Nginx Reverse Proxy

### 7.1. Cài đặt Nginx

```bash
sudo apt install nginx -y
```

### 7.2. Tạo Nginx config

```bash
sudo nano /etc/nginx/sites-available/9caratonline.com
```

### 7.3. Nội dung config:

```nginx
server {
    listen 80;
    server_name 9caratonline.com www.9caratonline.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 9caratonline.com www.9caratonline.com;

    # SSL Certificate (sử dụng Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/9caratonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/9caratonline.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeouts for long requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### 7.4. Enable site và test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/9caratonline.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Bước 8: Setup SSL Certificate (Let's Encrypt)

### 8.1. Cài đặt Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2. Lấy SSL certificate

```bash
sudo certbot --nginx -d 9caratonline.com -d www.9caratonline.com
```

### 8.3. Auto-renewal (đã tự động setup)

```bash
# Test renewal
sudo certbot renew --dry-run
```

---

## ✅ Bước 9: Kiểm Tra và Test

### 9.1. Kiểm tra services đang chạy

```bash
docker-compose -f docker-compose.vps.yml ps
```

Kết quả mong đợi:
- ✅ `9carat-postgres` - Running
- ✅ `9carat-web` - Running
- ✅ `9carat-adminer` - Running (optional)

### 9.2. Kiểm tra website

1. Truy cập: `https://9caratonline.com`
2. Đăng nhập với admin:
   - Username: `admin`
   - Password: `Admin@12345`

### 9.3. Kiểm tra Admin Panel

1. Truy cập: `https://9caratonline.com/admin`
2. Kiểm tra các chức năng:
   - ✅ Quản lý Users
   - ✅ Quản lý VIP Levels
   - ✅ Quản lý Sản phẩm
   - ✅ Duyệt Nhiệm vụ
   - ✅ Audit Logs
   - ✅ Thông báo

---

## 🔄 Bước 10: Cập Nhật Code (Sau này)

### 10.1. Pull code mới

```bash
cd ~/projects/aeon
git pull origin main
```

### 10.2. Rebuild và restart

```bash
# Rebuild image
docker-compose -f docker-compose.vps.yml build

# Restart services
docker-compose -f docker-compose.vps.yml restart web

# Hoặc rebuild và restart tất cả
docker-compose -f docker-compose.vps.yml up -d --build
```

### 10.3. Nếu có thay đổi database schema

```bash
# Vào container web
docker exec -it 9carat-web sh

# Chạy migration
npx prisma db push

# Exit container
exit
```

---

## 🛠️ Các Lệnh Hữu Ích

### Xem logs

```bash
# Logs của web
docker-compose -f docker-compose.vps.yml logs -f web

# Logs của database
docker-compose -f docker-compose.vps.yml logs -f db

# Logs của tất cả services
docker-compose -f docker-compose.vps.yml logs -f
```

### Restart services

```bash
# Restart web
docker-compose -f docker-compose.vps.yml restart web

# Restart tất cả
docker-compose -f docker-compose.vps.yml restart
```

### Stop/Start services

```bash
# Stop tất cả
docker-compose -f docker-compose.vps.yml down

# Start tất cả
docker-compose -f docker-compose.vps.yml up -d
```

### Backup database

```bash
# Backup
docker exec 9carat-postgres pg_dump -U postgres carat9_reward > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker exec -i 9carat-postgres psql -U postgres carat9_reward < backup_file.sql
```

### Truy cập database (Adminer)

1. Tạo SSH tunnel:
   ```bash
   ssh -L 8080:localhost:8080 user@your-vps-ip
   ```

2. Truy cập: `http://localhost:8080`
   - System: PostgreSQL
   - Server: db
   - Username: postgres
   - Password: 9Carataloonline.
   - Database: carat9_reward

---

## 🐛 Troubleshooting

### Lỗi: Database connection failed

```bash
# Kiểm tra database đang chạy
docker-compose -f docker-compose.vps.yml ps db

# Kiểm tra logs
docker-compose -f docker-compose.vps.yml logs db

# Restart database
docker-compose -f docker-compose.vps.yml restart db
```

### Lỗi: Port 3000 đã được sử dụng

```bash
# Tìm process đang dùng port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Lỗi: Ảnh không hiển thị

1. Kiểm tra Supabase Storage:
   - Bucket `products` đã tạo chưa?
   - Policies đã setup chưa?
   - URL và Key trong `.env` đúng chưa?

2. Kiểm tra logs:
   ```bash
   docker-compose -f docker-compose.vps.yml logs web | grep -i "supabase\|upload\|image"
   ```

### Lỗi: NextAuth secret không đúng

```bash
# Generate secret mới
openssl rand -base64 32

# Cập nhật trong .env và restart
docker-compose -f docker-compose.vps.yml restart web
```

---

## 📝 Thông Tin Quan Trọng

### Default Admin Account

- **Username**: `admin`
- **Password**: `Admin@12345`
- **Admin Level**: `LEVEL_1` (Toàn quyền)
- **Email**: `admin@9caratonline.com`

### Database Info

- **Host**: `db` (trong Docker network) hoặc `localhost` (từ host)
- **Port**: `5432`
- **Database**: `carat9_reward`
- **Username**: `postgres`
- **Password**: `9Carataloonline.`

### Ports

- **3000**: Next.js application
- **5432**: PostgreSQL (chỉ localhost)
- **8080**: Adminer (chỉ localhost, cần SSH tunnel)

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả các bước, bạn sẽ có:

✅ Website chạy tại `https://9caratonline.com`  
✅ Admin panel tại `https://9caratonline.com/admin`  
✅ Database PostgreSQL với dữ liệu seed  
✅ Supabase Storage cho upload ảnh  
✅ SSL certificate tự động renew  
✅ Docker containers tự động restart khi reboot  

**Chúc bạn deploy thành công! 🚀**


# 🚀 Hướng Dẫn Deploy 9Carat lên VPS

## 📋 Yêu Cầu

- **OS**: Ubuntu 20.04+ hoặc Debian 11+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Domain**: `9caratonline.com` (hoặc domain của bạn)

---

## ⚡ Quick Start

### 1. Clone project và vào thư mục

```bash
cd ~
git clone <your-repo-url> aeon
cd aeon
```

### 2. Tạo file `.env`

```bash
cp .env.vps .env
nano .env  # Cập nhật các giá trị cần thiết
```

### 3. Chạy script setup tự động

```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

Script sẽ tự động:
- ✅ Kiểm tra Docker
- ✅ Khởi động database
- ✅ Chạy migrations
- ✅ Seed database (VIP levels, Admin account)
- ✅ Build và khởi động ứng dụng

---

## 📝 Cấu Hình Chi Tiết

### File `.env`

Xem file `.env.vps` để biết các biến môi trường cần thiết:

- `DATABASE_URL`: Connection string đến PostgreSQL
- `NEXTAUTH_SECRET`: Secret key cho NextAuth (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: URL của ứng dụng (https://9caratonline.com)
- `NEXT_PUBLIC_BASE_URL`: Public URL
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL cho upload ảnh
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase API key

### Database

**Thông tin mặc định:**
- Database: `carat9_reward`
- User: `postgres`
- Password: `9Carataloonline.`
- Port: `5432` (chỉ localhost)

**Admin account mặc định:**
- Username: `admin`
- Password: `Admin@12345`
- Email: `admin@9caratonline.com`
- Admin Level: `LEVEL_1` (toàn quyền)

---

## 🔧 Các Script Có Sẵn

### `setup-vps.sh`
Setup toàn bộ hệ thống lần đầu (database, migrations, seed, build app)

### `deploy-vps.sh`
Deploy lại ứng dụng (pull code, rebuild, restart)

### `setup-db-vps.sh`
Chỉ setup database (migrations, seed)

---

## 🗄️ Database Commands

### Chạy migrations

```bash
npx prisma migrate deploy
```

### Seed database

```bash
npm run db:seed:all
```

### Prisma Studio (quản lý database)

```bash
npx prisma studio
```

Truy cập: `http://localhost:5555`

---

## 🐳 Docker Commands

### Khởi động tất cả services

```bash
docker-compose -f docker-compose.vps.yml up -d
```

### Dừng tất cả services

```bash
docker-compose -f docker-compose.vps.yml down
```

### Xem logs

```bash
# Logs của web app
docker-compose -f docker-compose.vps.yml logs -f web

# Logs của database
docker-compose -f docker-compose.vps.yml logs -f db
```

### Rebuild và restart

```bash
docker-compose -f docker-compose.vps.yml up -d --build
```

### Xem trạng thái containers

```bash
docker-compose -f docker-compose.vps.yml ps
```

---

## 🌐 Cấu Hình Nginx (Reverse Proxy)

Nếu bạn dùng Nginx làm reverse proxy:

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

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

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
}
```

---

## 🔒 Bảo Mật

### 1. Firewall

Chỉ mở các port cần thiết:

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Database

- Database chỉ listen trên localhost (127.0.0.1)
- Không expose port 5432 ra ngoài
- Sử dụng password mạnh

### 3. Environment Variables

- Không commit file `.env` vào git
- Sử dụng secret key mạnh cho `NEXTAUTH_SECRET`
- Rotate keys định kỳ

---

## 📊 Monitoring

### Xem logs real-time

```bash
docker-compose -f docker-compose.vps.yml logs -f
```

### Kiểm tra resource usage

```bash
docker stats
```

### Kiểm tra disk space

```bash
df -h
docker system df
```

---

## 🔄 Backup & Restore

### Backup database

```bash
docker exec 9carat-postgres pg_dump -U postgres carat9_reward > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database

```bash
docker exec -i 9carat-postgres psql -U postgres carat9_reward < backup.sql
```

---

## 🐛 Troubleshooting

### Container không start

```bash
# Xem logs
docker-compose -f docker-compose.vps.yml logs web

# Kiểm tra database connection
docker exec -it 9carat-postgres psql -U postgres -d carat9_reward
```

### Migration lỗi

```bash
# Reset database (⚠️ Mất dữ liệu)
npx prisma migrate reset

# Hoặc apply migrations thủ công
npx prisma migrate deploy
```

### Port đã được sử dụng

```bash
# Kiểm tra port
sudo lsof -i :3000
sudo lsof -i :5432

# Kill process
sudo kill -9 <PID>
```

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của containers
2. File `.env` có đúng không
3. Database có chạy không
4. Port có bị conflict không

---

## ✅ Checklist Deploy

- [ ] Docker và Docker Compose đã cài đặt
- [ ] File `.env` đã được tạo và cấu hình
- [ ] Database container đã chạy
- [ ] Migrations đã được apply
- [ ] Database đã được seed (VIP levels, Admin)
- [ ] Web container đã build và chạy
- [ ] Nginx đã được cấu hình (nếu dùng)
- [ ] SSL certificate đã được cài đặt (nếu dùng HTTPS)
- [ ] Firewall đã được cấu hình
- [ ] Backup strategy đã được thiết lập

---

**🎉 Chúc bạn deploy thành công!**


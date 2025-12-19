# 🚀 HƯỚNG DẪN DEPLOY LÊN VPS UBUNTU

## 📋 THÔNG TIN VPS

- **Domain:** 9caratonline.com
- **IP VPS:** 72.62.120.215
- **SSH:** `ssh root@72.62.120.215`
- **Database Password:** 9Carat@online.

## 📋 YÊU CẦU

- VPS Ubuntu 20.04+ (hoặc 22.04)
- Quyền root hoặc sudo
- Domain: 9caratonline.com (đã có)
- Port 3000, 5432, 8080 (cho adminer) mở

---

## 🔧 BƯỚC 1: CÀI ĐẶT DOCKER & DOCKER COMPOSE

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user hiện tại vào docker group (để chạy docker không cần sudo)
# $USER là biến tự động = username bạn đang đăng nhập (ví dụ: ubuntu, root, admin)
# Không cần thay "ubuntu", $USER tự động lấy username hiện tại
sudo usermod -aG docker $USER

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra
docker --version
docker-compose --version


# ĐĂNG XUẤT VÀ ĐĂNG NHẬP LẠI ĐỂ ÁP DỤNG "docker group"

# Bạn cần đăng xuất rồi đăng nhập lại (hoặc khởi động lại VPS) để hệ thống nhận việc bạn đã được thêm vào nhóm "docker".
# Sau đó kiểm tra lại quyền bằng cách chạy:
groups

# Kết quả phải có "docker" trong danh sách, ví dụ:
# ubuntu : ubuntu sudo docker

# Nếu vẫn chưa thấy "docker" trong nhóm, hãy thử:
# - Khởi động lại VPS: 
sudo reboot

# Sau khi đăng nhập lại, kiểm tra lại với lệnh "groups".
# Lúc này bạn có thể chạy lệnh "docker" mà KHÔNG cần sudo.

## 🔧 BƯỚC 2: CÀI ĐẶT NODE.JS

```bash
# Cài Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra
node --version
npm --version
```

---

## 📦 BƯỚC 3: UPLOAD PROJECT LÊN VPS

### Cách 1: Dùng SCP (từ máy Windows)

```bash
# Trên máy Windows, mở PowerShell
scp -r C:\Users\hng\Documents\aeon root@72.62.120.215:/root/

# Hoặc nén trước rồi upload
# Nén project (trừ node_modules, .next)
# Upload file ZIP
scp aeon.zip root@72.62.120.215:/root/
```

### Cách 2: Dùng Git

```bash
# Trên VPS
cd /root
git clone YOUR_REPO_URL
cd aeon
```

### Cách 3: Dùng SFTP (FileZilla, WinSCP)

Upload toàn bộ project folder lên `/root/aeon`

---

## 🗄️ BƯỚC 4: SETUP DATABASE VỚI ADMINER

Tạo file `docker-compose.yml` mới cho VPS:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: 9carat-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 9Carat@online.
      POSTGRES_DB: carat9_reward
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"
      LC_ALL: en_US.UTF-8
      LANG: en_US.UTF-8
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: 9carat-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: db
    depends_on:
      - db

volumes:
  postgres_data:
```

**Lưu ý:** Mật khẩu database đã được set: `9Carat@online.`

---

## 🚀 BƯỚC 5: KHỞI ĐỘNG DATABASE

```bash
cd /root/aeon

# Khởi động database và adminer (dùng file docker-compose.vps.yml)
docker-compose -f docker-compose.vps.yml up -d

# Kiểm tra containers đang chạy
docker ps

# Đợi 10 giây để database khởi động
sleep 10
```

---

## 📝 BƯỚC 6: CẤU HÌNH ENVIRONMENT

Tạo file `.env.local`:

```bash
nano .env.local
```

Nội dung:

```env
# Database
DATABASE_URL="postgresql://postgres:9Carataloonline.@localhost:5432/carat9_reward?schema=public"

# NextAuth
NEXTAUTH_SECRET="C7qY3kvsK+05MeDL1zSQnvQz7ZvOVNwZWyXDMt7VeO0="
NEXTAUTH_URL="https://9caratonline.com"
# Hoặc dùng IP nếu chưa có SSL:
# NEXTAUTH_URL="http://72.62.120.215:3000"

# App
NEXT_PUBLIC_APP_URL="https://9caratonline.com"
# Hoặc dùng IP nếu chưa có SSL:
# NEXT_PUBLIC_APP_URL="http://72.62.120.215:3000"

# Node
NODE_ENV=production
```

**Lưu ý:**
- Mật khẩu database: `9Carataloonline.`
- Domain: `9caratonline.com`
- IP VPS: `72.62.120.215`
- Tạo `NEXTAUTH_SECRET` mạnh: `openssl rand -base64 32`

---

## 🔨 BƯỚC 7: SETUP DATABASE SCHEMA

```bash
# Cài dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Tạo database schema
npx prisma db push --accept-data-loss

# Seed dữ liệu mẫu
npx tsx prisma/seed-vip-levels.ts
npx tsx prisma/seed-tasks.ts
npx tsx prisma/seed-users.ts
```

---

## 🏃 BƯỚC 8: BUILD VÀ CHẠY ỨNG DỤNG

### Development mode:

```bash
npm run dev
```

Truy cập: `http://72.62.120.215:3000` hoặc `https://9caratonline.com`

### Production mode:

```bash
# Build
npm run build

# Chạy production
npm start
```

---

## 🌐 BƯỚC 9: CẤU HÌNH NGINX (TÙY CHỌN)

Nếu muốn dùng domain và HTTPS:

```bash
# Cài Nginx
sudo apt install nginx -y

# Tạo config
sudo nano /etc/nginx/sites-available/9carat
```

Nội dung:

```nginx
server {
    listen 80;
    server_name 9caratonline.com www.9caratonline.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt:

```bash
sudo ln -s /etc/nginx/sites-available/9carat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 BƯỚC 10: CÀI SSL VỚI CERTBOT (TÙY CHỌN)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d 9caratonline.com -d www.9caratonline.com
```

---

## 🗄️ TRUY CẬP ADMINER (QUẢN TRỊ DATABASE)

1. Truy cập: `http://72.62.120.215:8080` (hoặc dùng SSH tunnel)
2. Đăng nhập:
   - **System:** PostgreSQL
   - **Server:** db (hoặc localhost)
   - **Username:** postgres
   - **Password:** 9Carat@online.
   - **Database:** carat9_reward

---

## 🔒 BẢO MẬT

### 1. Đổi port Adminer (không expose ra ngoài):

Sửa `docker-compose.yml`:

```yaml
adminer:
  ports:
    - "127.0.0.1:8080:8080"  # Chỉ localhost
```

Truy cập qua SSH tunnel:

```bash
# Từ máy local Windows (PowerShell hoặc CMD)
ssh -L 8080:localhost:8080 root@72.62.120.215
```

Sau đó truy cập: `http://localhost:8080`

### 2. Firewall:

```bash
# Cài UFW
sudo apt install ufw -y

# Cho phép SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Nếu không dùng Nginx

# Bật firewall
sudo ufw enable

# KHÔNG mở port 5432 và 8080 ra ngoài!
```

### 3. Đổi mật khẩu database mạnh:

```bash
docker exec -it 9carat-postgres psql -U postgres
ALTER USER postgres WITH PASSWORD 'your-strong-password-here';
\q
```

---

## 🔄 QUẢN LÝ ỨNG DỤNG

### Chạy trong background (dùng PM2):

```bash
# Cài PM2
sudo npm install -g pm2

# Chạy app
pm2 start npm --name "9carat" -- start

# Xem logs
pm2 logs 9carat

# Restart
pm2 restart 9carat

# Stop
pm2 stop 9carat

# Auto start khi reboot
pm2 startup
pm2 save
```

### Hoặc dùng systemd:

Tạo file `/etc/systemd/system/9carat.service`:

```ini
[Unit]
Description=9Carat Next.js App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/aeon
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Kích hoạt:

```bash
sudo systemctl daemon-reload
sudo systemctl enable 9carat
sudo systemctl start 9carat
sudo systemctl status 9carat
```

---

## 📊 TÀI KHOẢN MẶC ĐỊNH

Sau khi seed, có sẵn:

**Admin:**
- Username: `admin`
- Password: `Admin@123`

**User:**
- Username: `demo`
- Password: `Demo@123`

**⚠️ ĐỔI MẬT KHẨU NGAY SAU KHI DEPLOY!**

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to database"

```bash
# Kiểm tra container
docker ps

# Kiểm tra logs
docker logs 9carat-postgres

# Kiểm tra connection
docker exec -it 9carat-postgres psql -U postgres -d carat9_reward -c "SELECT 1;"
```

### Lỗi: "Port 3000 already in use"

```bash
# Tìm process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Lỗi: "Permission denied"

```bash
# Fix permissions (nếu dùng root thì không cần)
# sudo chown -R root:root /root/aeon
```

---

## 📝 CHECKLIST SAU KHI DEPLOY

- [ ] Database đã tạo và có schema
- [ ] Adminer truy cập được (http://72.62.120.215:8080)
- [ ] App chạy được (https://9caratonline.com hoặc http://72.62.120.215:3000)
- [ ] Đăng nhập admin được
- [ ] Đổi mật khẩu admin
- [ ] Firewall đã cấu hình
- [ ] SSL đã cài (nếu có domain)
- [ ] PM2/systemd đã setup auto-start

---

## 🔗 CÁC URL QUAN TRỌNG

- **App:** https://9caratonline.com (hoặc http://72.62.120.215:3000)
- **Admin:** https://9caratonline.com/admin
- **Adminer:** http://72.62.120.215:8080 (hoặc dùng SSH tunnel)
- **Database:** localhost:5432 (chỉ trong VPS)

---

## 📞 HỖ TRỢ

Nếu gặp lỗi, kiểm tra:
1. Docker logs: `docker logs 9carat-postgres`
2. App logs: `pm2 logs 9carat` hoặc `journalctl -u 9carat`
3. Nginx logs: `sudo tail -f /var/log/nginx/error.log`


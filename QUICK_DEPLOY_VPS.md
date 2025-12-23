# ⚡ Quick Deploy VPS - 9Carat

## 🚀 Deploy Nhanh (3 bước)

### Bước 1: Clone và vào thư mục

```bash
cd ~
git clone <your-repo-url> aeon
cd aeon
```

### Bước 2: Tạo file .env

```bash
cp .env.vps .env
nano .env  # Cập nhật domain và secrets
```

### Bước 3: Chạy setup

```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

**Xong!** Ứng dụng sẽ chạy tại `http://localhost:3000`

---

## 📝 Thông Tin Đăng Nhập Mặc Định

**Admin Account:**
- Username: `admin`
- Password: `Admin@12345`
- Email: `admin@9caratonline.com`

**Database:**
- Database: `carat9_reward`
- User: `postgres`
- Password: `9Carataloonline.`

---

## 🔄 Deploy Lại (Sau Khi Update Code)

```bash
./deploy-vps.sh
```

---

## 🗄️ Chỉ Setup Database

```bash
./setup-db-vps.sh
```

---

## 📊 Xem Logs

```bash
docker-compose -f docker-compose.vps.yml logs -f web
```

---

## 🛑 Dừng Ứng Dụng

```bash
docker-compose -f docker-compose.vps.yml down
```

---

## 🚀 Khởi Động Lại

```bash
docker-compose -f docker-compose.vps.yml up -d
```

---

Xem `README_VPS.md` để biết chi tiết hơn.


# 📦 HƯỚNG DẪN XỬ LÝ DATABASE KHI CHUYỂN PROJECT

## ⚠️ QUAN TRỌNG: Database KHÔNG được bao gồm trong ZIP

Khi bạn xóa `node_modules` và nén project thành ZIP, **database KHÔNG được gửi đi** vì:

1. Database chạy trên Docker container
2. Dữ liệu được lưu trong Docker volumes (không nằm trong project folder)
3. ZIP chỉ chứa code, không chứa dữ liệu database

---

## 🔄 CÁCH 1: Setup Database MỚI (Khuyến nghị)

Người nhận sẽ tạo database mới với dữ liệu mẫu:

### Bước 1: Giải nén ZIP và cài dependencies
```bash
# Giải nén ZIP
# Mở terminal trong thư mục project

# Cài dependencies
npm install
```

### Bước 2: Khởi động database
```bash
# Chạy database trên Docker
docker-compose -f docker-compose.db-only.yml up -d

# Đợi 15 giây để database khởi động
```

### Bước 3: Setup database schema
```bash
# Generate Prisma Client
npx prisma generate

# Tạo database schema
npx prisma db push --accept-data-loss
```

### Bước 4: Seed dữ liệu mẫu
```bash
# Seed VIP levels
npx tsx prisma/seed-vip-levels.ts

# Seed tasks
npx tsx prisma/seed-tasks.ts

# Seed demo accounts (admin + user)
npx tsx prisma/seed-users.ts
```

### Bước 5: Chạy app
```bash
npm run dev
```

### Kết quả:
✅ Database mới được tạo  
✅ Có sẵn 2 tài khoản demo:
- **Admin**: username=`admin`, password=`Admin@123`, balance=$10,000
- **User**: username=`demo`, password=`Demo@123`, balance=$1,000

---

## 📤 CÁCH 2: Export Database từ Máy Cũ (Nếu cần dữ liệu thật)

Nếu bạn muốn gửi kèm dữ liệu database thật từ máy cũ:

### Bước 1: Export database trên máy cũ
```bash
# Đảm bảo Docker container đang chạy
docker-compose -f docker-compose.db-only.yml ps

# Export database
docker exec 9carat-postgres-dev pg_dump -U postgres carat9_reward > database_backup.sql
```

### Bước 2: Thêm file `database_backup.sql` vào ZIP
- Copy file `database_backup.sql` vào thư mục project
- Nén lại thành ZIP (có thể đặt tên `database_backup.sql`)

### Bước 3: Import trên máy mới
```bash
# Giải nén ZIP
# Cài dependencies
npm install

# Khởi động database
docker-compose -f docker-compose.db-only.yml up -d

# Đợi 15 giây
timeout /t 15

# Import database
docker exec -i 9carat-postgres-dev psql -U postgres carat9_reward < database_backup.sql
```

---

## 🚀 CÁCH 3: Sử dụng start.bat (Tự động hóa)

Nếu có file `start.bat` trong project:

1. Giải nén ZIP
2. Chạy `start.bat` (Windows)
3. Script sẽ tự động:
   - Cài dependencies
   - Khởi động database
   - Setup schema
   - Seed dữ liệu mẫu

---

## 📋 CHECKLIST KHI GỬI PROJECT

### ✅ Nên có trong ZIP:
- [x] Toàn bộ source code (`src/`)
- [x] `package.json` và `package-lock.json`
- [x] `prisma/schema.prisma`
- [x] `prisma/seed-*.ts` (các file seed)
- [x] `docker-compose.db-only.yml`
- [x] `.env.example` hoặc hướng dẫn cấu hình
- [x] `HOW_TO_RUN.txt` hoặc `SETUP_GUIDE.txt`
- [x] `start.bat` (nếu có)

### ❌ KHÔNG cần trong ZIP:
- [x] `node_modules/` (sẽ cài lại bằng `npm install`)
- [x] `.next/` (sẽ build lại)
- [x] `database_backup.sql` (chỉ nếu muốn gửi dữ liệu thật)

---

## 🔍 KIỂM TRA SAU KHI SETUP

Sau khi setup xong, kiểm tra:

1. **Database đã chạy:**
   ```bash
   docker ps
   # Phải thấy container: 9carat-postgres-dev
   ```

2. **Có thể kết nối database:**
   ```bash
   docker exec -it 9carat-postgres-dev psql -U postgres -d carat9_reward
   # Gõ: \dt (xem các bảng)
   # Gõ: \q (thoát)
   ```

3. **Có tài khoản demo:**
   - Truy cập: http://localhost:3000/login
   - Đăng nhập với `admin` / `Admin@123`

---

## ❓ FAQ

**Q: Tại sao không có database trong ZIP?**  
A: Database chạy trên Docker, dữ liệu lưu trong Docker volumes (không nằm trong project folder).

**Q: Làm sao để có dữ liệu giống máy cũ?**  
A: Export database từ máy cũ (CÁCH 2) hoặc setup mới với seed data (CÁCH 1).

**Q: Có mất dữ liệu không?**  
A: Nếu setup mới (CÁCH 1) thì sẽ là database trống + dữ liệu mẫu. Nếu muốn giữ dữ liệu cũ, dùng CÁCH 2.

**Q: Có thể dùng database từ máy khác không?**  
A: Có, export từ máy cũ và import vào máy mới (CÁCH 2).

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra Docker đã cài và đang chạy
2. Kiểm tra port 5432 chưa bị chiếm
3. Xem logs: `docker logs 9carat-postgres-dev`
4. Xem file `HOW_TO_RUN.txt` hoặc `SETUP_GUIDE.txt`


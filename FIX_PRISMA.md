# 🔧 HƯỚNG DẪN SỬA LỖI PRISMA

## ❌ Lỗi hiện tại:
- `Cannot read properties of undefined (reading 'create')` - Prisma chưa có model `WheelPrize`
- `Unknown field 'freeSpins'` - Prisma Client chưa có field `freeSpins` trong User

## ✅ CÁCH SỬA:

### Bước 1: Tắt Dev Server
- Nhấn `Ctrl + C` trong terminal đang chạy `npm run dev`
- Hoặc chạy: `taskkill /F /IM node.exe`

### Bước 2: Generate Prisma Client
```bash
npx prisma generate
```

### Bước 3: Push Schema vào Database
```bash
npx prisma db push --accept-data-loss
```

### Bước 4: Restart Dev Server
```bash
npm run dev
```

## ✅ SAU KHI SỬA:
- Model `WheelPrize` sẽ có sẵn
- Field `freeSpins` trong User sẽ hoạt động
- Có thể thêm sản phẩm vào vòng quay
- Vòng quay sẽ hoạt động bình thường


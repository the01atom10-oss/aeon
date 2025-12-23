-- Migration: Tạo bảng trung gian ShopGroupTaskProduct
-- Cho phép quan hệ many-to-many giữa ShopGroup và TaskProduct
-- Một sản phẩm có thể thuộc nhiều gian hàng

-- Tạo bảng ShopGroupTaskProduct
CREATE TABLE IF NOT EXISTS "ShopGroupTaskProduct" (
    "id" TEXT NOT NULL,
    "shopGroupId" TEXT NOT NULL,
    "taskProductId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopGroupTaskProduct_pkey" PRIMARY KEY ("id")
);

-- Tạo unique constraint để một sản phẩm chỉ có thể thêm vào một gian hàng một lần
CREATE UNIQUE INDEX IF NOT EXISTS "ShopGroupTaskProduct_shopGroupId_taskProductId_key" 
ON "ShopGroupTaskProduct"("shopGroupId", "taskProductId");

-- Tạo indexes
CREATE INDEX IF NOT EXISTS "ShopGroupTaskProduct_shopGroupId_idx" 
ON "ShopGroupTaskProduct"("shopGroupId");

CREATE INDEX IF NOT EXISTS "ShopGroupTaskProduct_taskProductId_idx" 
ON "ShopGroupTaskProduct"("taskProductId");

CREATE INDEX IF NOT EXISTS "ShopGroupTaskProduct_sortOrder_idx" 
ON "ShopGroupTaskProduct"("sortOrder");

-- Tạo foreign keys
ALTER TABLE "ShopGroupTaskProduct" 
ADD CONSTRAINT "ShopGroupTaskProduct_shopGroupId_fkey" 
FOREIGN KEY ("shopGroupId") REFERENCES "ShopGroup"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShopGroupTaskProduct" 
ADD CONSTRAINT "ShopGroupTaskProduct_taskProductId_fkey" 
FOREIGN KEY ("taskProductId") REFERENCES "TaskProduct"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Hoàn thành!


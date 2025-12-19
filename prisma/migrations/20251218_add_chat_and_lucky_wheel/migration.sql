-- AlterTable User: Add balance field
ALTER TABLE "User" ADD COLUMN "balance" DECIMAL(20,2) NOT NULL DEFAULT 0;

-- AlterEnum TransactionType: Add LUCKY_WHEEL
ALTER TYPE "TransactionType" ADD VALUE 'LUCKY_WHEEL';

-- CreateTable ChatMessage
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable LuckyWheelSpin
CREATE TABLE "LuckyWheelSpin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" INTEGER NOT NULL,
    "prizeName" TEXT NOT NULL,
    "prizeAmount" INTEGER NOT NULL,
    "spinCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LuckyWheelSpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "LuckyWheelSpin_userId_idx" ON "LuckyWheelSpin"("userId");

-- CreateIndex
CREATE INDEX "LuckyWheelSpin_createdAt_idx" ON "LuckyWheelSpin"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LuckyWheelSpin" ADD CONSTRAINT "LuckyWheelSpin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;



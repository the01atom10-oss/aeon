# ================================
# Dockerfile - Next.js Production
# ================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl openssl-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl openssl-dev
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

# Copy public folder
COPY --from=builder /app/public ./public

# Copy .next folder (build output)
COPY --from=builder /app/.next ./.next

# Copy toàn bộ node_modules để đảm bảo đầy đủ dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema và generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Tạo thư mục uploads nếu chưa có và set quyền
RUN mkdir -p /app/public/uploads/products && \
    chmod -R 755 /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Chạy Next.js bình thường, không dùng standalone
CMD ["npm", "start"]

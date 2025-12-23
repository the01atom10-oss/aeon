#!/bin/bash

# Script setup database cho VPS
# Chạy: bash setup-db.sh

echo "🚀 Starting database setup..."
echo ""

# 1. Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# 2. Push schema to database
echo "📊 Step 2: Pushing schema to database..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema"
    exit 1
fi
echo "✅ Schema pushed to database"
echo ""

# 3. Seed all data
echo "🌱 Step 3: Seeding database..."
npm run db:seed:all
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo "✅ Database seeded"
echo ""

echo "🎉 Database setup completed successfully!"
echo ""
echo "📝 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: Admin@12345"
echo "   Admin Level: LEVEL_1 (Toàn quyền)"
echo ""


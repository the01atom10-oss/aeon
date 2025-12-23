# Script setup database cho Windows
# Chạy: .\setup-db.ps1

Write-Host "🚀 Starting database setup..." -ForegroundColor Cyan
Write-Host ""

# 1. Generate Prisma Client
Write-Host "📦 Step 1: Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# 2. Push schema to database
Write-Host "📊 Step 2: Pushing schema to database..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema pushed to database" -ForegroundColor Green
Write-Host ""

# 3. Seed all data
Write-Host "🌱 Step 3: Seeding database..." -ForegroundColor Yellow
npm run db:seed:all
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database seeded" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Default Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: Admin@12345" -ForegroundColor White
Write-Host "   Admin Level: LEVEL_1 (Toàn quyền)" -ForegroundColor White
Write-Host ""


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting full database seed...\n')

    try {
        // 1. Seed VIP Levels
        console.log('📊 Step 1: Seeding VIP Levels...')
        const { execSync } = require('child_process')
        execSync('npx tsx prisma/seed-vip-levels.ts', { stdio: 'inherit' })
        console.log('✅ VIP Levels seeded\n')

        // 2. Seed Admin User
        console.log('👤 Step 2: Seeding Admin User...')
        execSync('npx tsx prisma/seed-admin.ts', { stdio: 'inherit' })
        console.log('✅ Admin User seeded\n')

        // 3. Seed Tasks
        console.log('📋 Step 3: Seeding Tasks...')
        execSync('npx tsx prisma/seed-tasks.ts', { stdio: 'inherit' })
        console.log('✅ Tasks seeded\n')

        console.log('🎉 All seeds completed successfully!')
        console.log('\n📝 Default Admin Credentials:')
        console.log('   Username: admin')
        console.log('   Password: Admin@12345')
        console.log('   Admin Level: LEVEL_1 (Toàn quyền)')
    } catch (error) {
        console.error('❌ Seed failed:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


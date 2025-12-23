import { PrismaClient } from '@prisma/client'

// Sử dụng database carat9_reward với mật khẩu 9Carataloonline. (giống VPS)
// URL encode mật khẩu: 9Carataloonline. -> 9Carataloonline%2E
const defaultUrl = 'postgresql://postgres:9Carataloonline%2E@localhost:5432/carat9_reward?schema=public'
const databaseUrl = process.env.DATABASE_URL || defaultUrl

// Nếu DATABASE_URL có database khác, thay thế bằng carat9_reward
let fixedDatabaseUrl = databaseUrl
if (databaseUrl.includes('aeon_reward')) {
    fixedDatabaseUrl = databaseUrl.replace('aeon_reward', 'carat9_reward')
} else if (databaseUrl.includes('postgres@localhost') && !databaseUrl.includes('carat9_reward')) {
    // Thay thế toàn bộ URL
    fixedDatabaseUrl = defaultUrl
}

// Đảm bảo mật khẩu được URL encode
if (fixedDatabaseUrl.includes('9Carataloonline.') && !fixedDatabaseUrl.includes('9Carataloonline%2E')) {
    fixedDatabaseUrl = fixedDatabaseUrl.replace('9Carataloonline.', '9Carataloonline%2E')
}

console.log('🔗 Using DATABASE_URL:', fixedDatabaseUrl.replace(/:[^:@]+@/, ':****@'))

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: fixedDatabaseUrl
        }
    }
})

async function main() {
    console.log('🌱 Seeding tasks...')

    // Get or create VIP levels first
    const vipLevels = await prisma.vipLevel.findMany({
        orderBy: { minBalance: 'asc' }
    })

    if (vipLevels.length === 0) {
        console.log('❌ No VIP levels found. Please seed VIP levels first.')
        return
    }

    // Create tasks for each VIP level
    for (const vipLevel of vipLevels) {
        const existingTask = await prisma.task.findFirst({
            where: { vipLevelId: vipLevel.id }
        })

        if (!existingTask) {
            await prisma.task.create({
                data: {
                    vipLevelId: vipLevel.id,
                    name: `Nhiệm vụ ${vipLevel.name}`,
                    description: `Nhiệm vụ dành cho thành viên ${vipLevel.name}`,
                    basePrice: 100, // Base price doesn't matter much, product price is what matters
                    rewardRate: vipLevel.commissionRate,
                    isActive: true
                }
            })
            console.log(`✅ Created task for ${vipLevel.name}`)
        } else {
            console.log(`⏭️  Task for ${vipLevel.name} already exists`)
        }
    }

    console.log('✅ Tasks seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding tasks:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


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
    console.log('🌱 Seeding VIP levels...')

    // Create VIP Levels theo yêu cầu
    const vipLevels = [
        {
            name: 'ĐỒNG',
            minBalance: 0,
            commissionRate: 0.005, // 0.5%
            maxOrders: 60,
            autoApproveLimit: 30, // 30 đơn đầu tự động, từ đơn 31 cần duyệt
            sortOrder: 1,
        },
        {
            name: 'BẠC',
            minBalance: 1000,
            commissionRate: 0.006, // 0.6%
            maxOrders: 80,
            autoApproveLimit: 40, // 40 đơn đầu tự động
            sortOrder: 2,
        },
        {
            name: 'VÀNG',
            minBalance: 5000,
            commissionRate: 0.007, // 0.7%
            maxOrders: 100,
            autoApproveLimit: 50, // 50 đơn đầu tự động
            sortOrder: 3,
        },
        {
            name: 'BẠCH KIM',
            minBalance: 10000,
            commissionRate: 0.008, // 0.8%
            maxOrders: 120,
            autoApproveLimit: 60, // 60 đơn đầu tự động
            sortOrder: 4,
        },
        {
            name: 'KIM CƯƠNG',
            minBalance: 20000,
            commissionRate: 0.012, // 1.2%
            maxOrders: 140,
            autoApproveLimit: 70, // 70 đơn đầu tự động
            sortOrder: 5,
        },
        {
            name: 'PREMIUM VIP',
            minBalance: 50000,
            commissionRate: 0.015, // 1.5%
            maxOrders: 160,
            autoApproveLimit: 80, // 80 đơn đầu tự động
            sortOrder: 6,
        },
    ]

    for (const level of vipLevels) {
        const vipLevel = await prisma.vipLevel.upsert({
            where: { name: level.name },
            update: {
                minBalance: level.minBalance,
                commissionRate: level.commissionRate,
                maxOrders: level.maxOrders,
                autoApproveLimit: level.autoApproveLimit,
                sortOrder: level.sortOrder,
                isActive: true
            },
            create: {
                ...level,
                isActive: true
            },
        })
        console.log(`✅ VIP Level: ${vipLevel.name} (min: $${vipLevel.minBalance}, rate: ${Number(vipLevel.commissionRate) * 100}%, max: ${vipLevel.maxOrders}, auto: ${vipLevel.autoApproveLimit})`)
    }

    console.log('✅ VIP levels seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding VIP levels:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding VIP levels...')

    // Create VIP Levels
    const vipLevels = [
        {
            name: 'Thành viên',
            minBalance: 0,
            commissionRate: 0.005, // 0.5%
            sortOrder: 1,
        },
        {
            name: 'Thành viên Vàng',
            minBalance: 1000,
            commissionRate: 0.01, // 1%
            sortOrder: 2,
        },
        {
            name: 'Thành viên Bạc',
            minBalance: 5000,
            commissionRate: 0.015, // 1.5%
            sortOrder: 3,
        },
        {
            name: 'Thành viên Kim Cương',
            minBalance: 10000,
            commissionRate: 0.02, // 2%
            sortOrder: 4,
        },
    ]

    for (const level of vipLevels) {
        const vipLevel = await prisma.vipLevel.upsert({
            where: { name: level.name },
            update: {
                minBalance: level.minBalance,
                commissionRate: level.commissionRate,
                sortOrder: level.sortOrder,
                isActive: true
            },
            create: {
                ...level,
                isActive: true
            },
        })
        console.log(`✅ VIP Level: ${vipLevel.name} (min: $${vipLevel.minBalance}, rate: ${Number(vipLevel.commissionRate) * 100}%)`)
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


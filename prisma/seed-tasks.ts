import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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


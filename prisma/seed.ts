import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Create admin user với adminLevel LEVEL_1
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10)
    const adminPinHash = await bcrypt.hash('0000', 10)
    
    // Tạo mã mời cho admin
    const adminInviteCode = 'ADMIN001'
    
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            passwordHash: adminPasswordHash,
            withdrawalPinHash: adminPinHash,
            role: UserRole.ADMIN,
            adminLevel: 'LEVEL_1',
            inviteCode: adminInviteCode,
            status: 'ACTIVE',
        },
        create: {
            username: 'admin',
            email: 'admin@9caratonline.com',
            passwordHash: adminPasswordHash,
            withdrawalPinHash: adminPinHash,
            role: UserRole.ADMIN,
            adminLevel: 'LEVEL_1', // Admin cấp 1 - toàn quyền
            inviteCode: adminInviteCode,
            balance: 0,
            status: 'ACTIVE',
        },
    })
    console.log('✅ Admin user created:', admin.username)
    console.log('   - Password: Admin@12345')
    console.log('   - Admin Level: LEVEL_1 (Toàn quyền)')
    console.log('   - Invite Code:', adminInviteCode)

    // Create test users
    const testUserPasswordHash = await bcrypt.hash('Test@12345', 10)
    const testUserPinHash = await bcrypt.hash('0000', 10)
    const testUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            username: 'testuser',
            email: 'user@example.com',
            passwordHash: testUserPasswordHash,
            withdrawalPinHash: testUserPinHash,
            role: UserRole.USER,
            balance: 100,
        },
    })
    console.log('✅ Test user created:', testUser.username)

    // Create VIP Levels
    const vipLevels = [
        {
            name: 'Bronze',
            minBalance: 0,
            commissionRate: 0.05, // 5%
            sortOrder: 1,
        },
        {
            name: 'Silver',
            minBalance: 1000,
            commissionRate: 0.08, // 8%
            sortOrder: 2,
        },
        {
            name: 'Gold',
            minBalance: 5000,
            commissionRate: 0.12, // 12%
            sortOrder: 3,
        },
        {
            name: 'Platinum',
            minBalance: 10000,
            commissionRate: 0.15, // 15%
            sortOrder: 4,
        },
    ]

    for (const level of vipLevels) {
        const vipLevel = await prisma.vipLevel.upsert({
            where: { name: level.name },
            update: {},
            create: level,
        })
        console.log('✅ VIP Level created:', vipLevel.name)
    }

    // Create sample tasks
    const bronzeLevel = await prisma.vipLevel.findUnique({ where: { name: 'Bronze' } })
    const silverLevel = await prisma.vipLevel.findUnique({ where: { name: 'Silver' } })

    if (bronzeLevel) {
        await prisma.task.upsert({
            where: { id: 'task-bronze-1' },
            update: {},
            create: {
                id: 'task-bronze-1',
                vipLevelId: bronzeLevel.id,
                name: 'Product Review Task',
                description: 'Review and rate products',
                basePrice: 50,
                rewardRate: 0.1, // 10% of price
                isActive: true,
            },
        })
        console.log('✅ Bronze task created')
    }

    if (silverLevel) {
        await prisma.task.upsert({
            where: { id: 'task-silver-1' },
            update: {},
            create: {
                id: 'task-silver-1',
                vipLevelId: silverLevel.id,
                name: 'Premium Product Review',
                description: 'Review premium products',
                basePrice: 100,
                rewardRate: 0.15, // 15% of price
                isActive: true,
            },
        })
        console.log('✅ Silver task created')
    }

    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

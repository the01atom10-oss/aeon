import { PrismaClient, UserRole, AdminLevel } from '@prisma/client'
import * as bcrypt from 'bcrypt'

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
    console.log('🌱 Seeding Admin user...')

    // Tạo admin với password Admin@12345
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10)
    const adminInviteCode = 'ADMIN001'

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            passwordHash: adminPasswordHash,
            role: UserRole.ADMIN,
            adminLevel: AdminLevel.LEVEL_1, // Admin cấp 1 - toàn quyền
            inviteCode: adminInviteCode,
            status: 'ACTIVE',
        },
        create: {
            username: 'admin',
            email: 'admin@9caratonline.com',
            passwordHash: adminPasswordHash,
            role: UserRole.ADMIN,
            adminLevel: AdminLevel.LEVEL_1, // Admin cấp 1 - toàn quyền
            inviteCode: adminInviteCode,
            balance: 0,
            status: 'ACTIVE',
            withdrawalPinHash: await bcrypt.hash('0000', 10),
        },
    })

    console.log('✅ Admin user created successfully!')
    console.log('   Username: admin')
    console.log('   Password: Admin@12345')
    console.log('   Admin Level: LEVEL_1 (Toàn quyền)')
    console.log('   Invite Code:', adminInviteCode)
    console.log('   Email:', admin.email)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding admin:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


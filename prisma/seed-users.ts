import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding demo users...')

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: 'admin' }
    })

    if (existingAdmin) {
        console.log('⏭️  Admin account already exists')
    } else {
        // Create admin account
        const adminPassword = await bcrypt.hash('Admin@123', 10)
        const adminPin = await bcrypt.hash('123456', 10)

        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@9carat.com',
                phone: '0123456789',
                passwordHash: adminPassword,
                withdrawalPinHash: adminPin,
                role: 'ADMIN',
                status: 'ACTIVE',
                balance: 10000, // $10,000 for testing
                inviteCode: Math.floor(1000000 + Math.random() * 9000000).toString()
            }
        })

        console.log('✅ Created admin account:')
        console.log('   Username: admin')
        console.log('   Password: Admin@123')
        console.log('   Email: admin@9carat.com')
        console.log('   PIN: 123456')
    }

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
        where: { username: 'demo' }
    })

    if (existingUser) {
        console.log('⏭️  Demo user already exists')
    } else {
        // Create demo user
        const userPassword = await bcrypt.hash('Demo@123', 10)
        const userPin = await bcrypt.hash('123456', 10)

        const demoUser = await prisma.user.create({
            data: {
                username: 'demo',
                email: 'demo@9carat.com',
                phone: '0987654321',
                passwordHash: userPassword,
                withdrawalPinHash: userPin,
                role: 'USER',
                status: 'ACTIVE',
                balance: 1000, // $1,000 for testing
                inviteCode: Math.floor(1000000 + Math.random() * 9000000).toString()
            }
        })

        console.log('✅ Created demo user:')
        console.log('   Username: demo')
        console.log('   Password: Demo@123')
        console.log('   Email: demo@9carat.com')
        console.log('   PIN: 123456')
    }

    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('   DEMO ACCOUNTS - READY TO USE!')
    console.log('═══════════════════════════════════════')
    console.log('')
    console.log('👤 ADMIN ACCOUNT:')
    console.log('   URL: http://localhost:3000/login')
    console.log('   Username: admin')
    console.log('   Password: Admin@123')
    console.log('   Balance: $10,000')
    console.log('')
    console.log('👤 USER ACCOUNT:')
    console.log('   URL: http://localhost:3000/login')
    console.log('   Username: demo')
    console.log('   Password: Demo@123')
    console.log('   Balance: $1,000')
    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding users:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


import { PrismaClient } from '@prisma/client'

// Sử dụng database carat9_reward với mật khẩu 9Carataloonline. (giống VPS)
const defaultUrl = 'postgresql://postgres:9Carataloonline%2E@localhost:5432/carat9_reward?schema=public'
const databaseUrl = process.env.DATABASE_URL || defaultUrl

// Đảm bảo mật khẩu được URL encode
let fixedDatabaseUrl = databaseUrl
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
    console.log('📊 Checking Audit Logs...\n')

    try {
        // Đếm tổng số audit logs
        const total = await prisma.adminAuditLog.count()
        console.log(`📈 Tổng số audit logs: ${total}\n`)

        if (total === 0) {
            console.log('ℹ️  Chưa có audit log nào trong database.')
            console.log('💡 Audit logs được tạo khi admin thực hiện các hành động như:')
            console.log('   - Điều chỉnh số dư user (Quick Balance)')
            console.log('   - Duyệt đơn hàng')
            console.log('   - Các thao tác quản trị khác\n')
            return
        }

        // Lấy 10 audit logs mới nhất
        const recentLogs = await prisma.adminAuditLog.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                admin: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                targetUser: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        console.log('📋 10 Audit Logs mới nhất:\n')
        console.log('─'.repeat(100))

        recentLogs.forEach((log, index) => {
            console.log(`\n${index + 1}. ID: ${log.id}`)
            console.log(`   ⏰ Thời gian: ${log.createdAt.toLocaleString('vi-VN')}`)
            console.log(`   👤 Admin: ${log.admin.username} (${log.admin.email || 'N/A'})`)
            console.log(`   🎯 Hành động: ${log.action}`)
            
            if (log.targetUser) {
                console.log(`   👥 User đích: ${log.targetUser.username} (${log.targetUser.email || 'N/A'})`)
            } else {
                console.log(`   👥 User đích: -`)
            }

            if (log.beforeBalance !== null && log.afterBalance !== null) {
                const before = Number(log.beforeBalance)
                const after = Number(log.afterBalance)
                const change = after - before
                console.log(`   💰 Số dư: $${before.toLocaleString('vi-VN')} → $${after.toLocaleString('vi-VN')} (${change >= 0 ? '+' : ''}${change.toLocaleString('vi-VN')})`)
            } else {
                console.log(`   💰 Số dư: -`)
            }

            if (log.note) {
                console.log(`   📝 Ghi chú: ${log.note}`)
            }

            if (log.metadata) {
                console.log(`   📦 Metadata: ${JSON.stringify(log.metadata, null, 2)}`)
            }

            console.log('─'.repeat(100))
        })

        // Thống kê theo action
        const actionStats = await prisma.adminAuditLog.groupBy({
            by: ['action'],
            _count: {
                id: true
            }
        })

        console.log('\n📊 Thống kê theo loại hành động:\n')
        actionStats.forEach(stat => {
            console.log(`   ${stat.action}: ${stat._count.id} lần`)
        })

    } catch (error) {
        console.error('❌ Error checking audit logs:', error)
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


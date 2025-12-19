import { prisma } from '@/lib/prisma'

export class AdminService {
    static async getAuditLogs(skip: number = 0, take: number = 50) {
        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                skip,
                take,
                include: {
                    admin: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                    targetUser: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.adminAuditLog.count(),
        ])

        return { logs, total }
    }

    static async getVipLevels() {
        return prisma.vipLevel.findMany({
            orderBy: {
                sortOrder: 'asc',
            },
        })
    }

    static async createVipLevel(data: {
        name: string
        minBalance: number
        commissionRate: number
        isActive?: boolean
        sortOrder?: number
    }) {
        return prisma.vipLevel.create({
            data: {
                name: data.name,
                minBalance: data.minBalance,
                commissionRate: data.commissionRate,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? 0,
            },
        })
    }
}

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
}

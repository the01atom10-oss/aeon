import { prisma } from '@/lib/prisma'
import { DepositStatus } from '@prisma/client'

export interface CreateDepositRequest {
    userId: string
    amount: number
    paymentMethod?: string
    paymentProof?: string
    note?: string
}

export class DepositService {
    static async createDepositRequest(input: CreateDepositRequest) {
        return prisma.depositRequest.create({
            data: {
                userId: input.userId,
                amount: input.amount,
                paymentMethod: input.paymentMethod,
                paymentProof: input.paymentProof,
                note: input.note,
                status: DepositStatus.PENDING,
            },
        })
    }

    static async getUserDeposits(userId: string, skip = 0, take = 20) {
        const [deposits, total] = await Promise.all([
            prisma.depositRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.depositRequest.count({ where: { userId } }),
        ])

        return { deposits, total }
    }

    static async getDepositById(id: string) {
        return prisma.depositRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        })
    }

    static async getAllDeposits(status?: DepositStatus, skip = 0, take = 20) {
        const where = status ? { status } : {}

        const [deposits, total] = await Promise.all([
            prisma.depositRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.depositRequest.count({ where }),
        ])

        return { deposits, total }
    }

    static async approveDeposit(id: string, adminId: string, adminNote?: string) {
        const deposit = await prisma.depositRequest.findUnique({
            where: { id },
            include: { user: { include: { wallet: true } } },
        })

        if (!deposit) {
            throw new Error('Deposit request not found')
        }

        if (deposit.status !== DepositStatus.PENDING) {
            throw new Error('Deposit request already processed')
        }

        if (!deposit.user.wallet) {
            throw new Error('User wallet not found')
        }

        // Use transaction to update both deposit and wallet
        return prisma.$transaction(async (tx) => {
            // Update deposit status
            const updatedDeposit = await tx.depositRequest.update({
                where: { id },
                data: {
                    status: DepositStatus.APPROVED,
                    processedBy: adminId,
                    processedAt: new Date(),
                    adminNote,
                },
            })

            // Update wallet balance
            const balanceBefore = deposit.user.wallet!.balance
            const balanceAfter = balanceBefore.add(deposit.amount)

            await tx.wallet.update({
                where: { userId: deposit.userId },
                data: { balance: balanceAfter },
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: deposit.userId,
                    type: 'DEPOSIT',
                    amount: deposit.amount,
                    status: 'POSTED',
                    description: `Nạp tiền được duyệt - ${adminNote || ''}`,
                    balanceBefore,
                    balanceAfter,
                    referenceId: deposit.id,
                    idempotencyKey: `deposit-${deposit.id}`,
                    createdBy: adminId,
                },
            })

            // Create admin audit log
            await tx.adminAuditLog.create({
                data: {
                    adminId,
                    action: 'APPROVE_DEPOSIT',
                    targetUserId: deposit.userId,
                    beforeBalance: balanceBefore,
                    afterBalance: balanceAfter,
                    note: `Duyệt nạp tiền ${deposit.amount}$ - ${adminNote || ''}`,
                    metadata: { depositId: deposit.id },
                },
            })

            return updatedDeposit
        })
    }

    static async rejectDeposit(id: string, adminId: string, adminNote?: string) {
        const deposit = await prisma.depositRequest.findUnique({
            where: { id },
        })

        if (!deposit) {
            throw new Error('Deposit request not found')
        }

        if (deposit.status !== DepositStatus.PENDING) {
            throw new Error('Deposit request already processed')
        }

        return prisma.$transaction(async (tx) => {
            const updatedDeposit = await tx.depositRequest.update({
                where: { id },
                data: {
                    status: DepositStatus.REJECTED,
                    processedBy: adminId,
                    processedAt: new Date(),
                    adminNote,
                },
            })

            await tx.adminAuditLog.create({
                data: {
                    adminId,
                    action: 'REJECT_DEPOSIT',
                    targetUserId: deposit.userId,
                    note: `Từ chối nạp tiền ${deposit.amount}$ - ${adminNote || ''}`,
                    metadata: { depositId: deposit.id },
                },
            })

            return updatedDeposit
        })
    }
}


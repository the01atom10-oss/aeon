import { prisma } from '@/lib/prisma'
import { WithdrawalStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

export interface CreateWithdrawalRequest {
    userId: string
    amount: number
    withdrawalPin: string
    bankName: string
    bankAccount: string
    bankAccountName: string
    note?: string
}

export class WithdrawalService {
    static async createWithdrawalRequest(input: CreateWithdrawalRequest) {
        // Verify user
        const user = await prisma.user.findUnique({
            where: { id: input.userId },
        })

        if (!user) {
            throw new Error('User not found')
        }

        if (!user.withdrawalPinHash) {
            throw new Error('Withdrawal PIN not set')
        }

        // Verify withdrawal PIN
        const isPinValid = await bcrypt.compare(input.withdrawalPin, user.withdrawalPinHash)
        if (!isPinValid) {
            throw new Error('Mã rút vốn không chính xác')
        }

        // Check balance
        const userBalance = Number(user.balance)
        if (userBalance < input.amount) {
            throw new Error('Số dư không đủ để thực hiện rút tiền')
        }

        return prisma.withdrawalRequest.create({
            data: {
                userId: input.userId,
                amount: input.amount,
                bankName: input.bankName,
                bankAccount: input.bankAccount,
                bankAccountName: input.bankAccountName,
                note: input.note,
                status: WithdrawalStatus.PENDING,
            },
        })
    }

    static async getUserWithdrawals(userId: string, skip = 0, take = 20) {
        const [withdrawals, total] = await Promise.all([
            prisma.withdrawalRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.withdrawalRequest.count({ where: { userId } }),
        ])

        return { withdrawals, total }
    }

    static async getWithdrawalById(id: string) {
        return prisma.withdrawalRequest.findUnique({
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

    static async getAllWithdrawals(status?: WithdrawalStatus, skip = 0, take = 20) {
        const where = status ? { status } : {}

        const [withdrawals, total] = await Promise.all([
            prisma.withdrawalRequest.findMany({
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
            prisma.withdrawalRequest.count({ where }),
        ])

        return { withdrawals, total }
    }

    static async approveWithdrawal(id: string, adminId: string, adminNote?: string) {
        const withdrawal = await prisma.withdrawalRequest.findUnique({
            where: { id },
            include: { user: true },
        })

        if (!withdrawal) {
            throw new Error('Withdrawal request not found')
        }

        if (withdrawal.status !== WithdrawalStatus.PENDING) {
            throw new Error('Withdrawal request already processed')
        }

        // Check balance again
        const userBalance = Number(withdrawal.user.balance)
        if (userBalance < withdrawal.amount) {
            throw new Error('Insufficient balance')
        }

        // Use transaction to update both withdrawal and wallet
        return prisma.$transaction(async (tx) => {
            // Update withdrawal status
            const updatedWithdrawal = await tx.withdrawalRequest.update({
                where: { id },
                data: {
                    status: WithdrawalStatus.APPROVED,
                    processedBy: adminId,
                    processedAt: new Date(),
                    adminNote,
                },
            })

            // Update user balance
            const balanceBefore = Number(withdrawal.user.balance)
            const balanceAfter = balanceBefore - withdrawal.amount

            await tx.user.update({
                where: { id: withdrawal.userId },
                data: { balance: balanceAfter },
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: withdrawal.userId,
                    type: 'WITHDRAWAL',
                    amount: withdrawal.amount,
                    status: 'POSTED',
                    description: `Rút tiền được duyệt - ${withdrawal.bankName} ${withdrawal.bankAccount} - ${adminNote || ''}`,
                    balanceBefore,
                    balanceAfter,
                    referenceId: withdrawal.id,
                    idempotencyKey: `withdrawal-${withdrawal.id}`,
                    createdBy: adminId,
                },
            })

            // Create admin audit log
            await tx.adminAuditLog.create({
                data: {
                    adminId,
                    action: 'APPROVE_WITHDRAWAL',
                    targetUserId: withdrawal.userId,
                    beforeBalance: balanceBefore,
                    afterBalance: balanceAfter,
                    note: `Duyệt rút tiền ${withdrawal.amount}$ - ${adminNote || ''}`,
                    metadata: { withdrawalId: withdrawal.id },
                },
            })

            return updatedWithdrawal
        })
    }

    static async rejectWithdrawal(id: string, adminId: string, adminNote?: string) {
        const withdrawal = await prisma.withdrawalRequest.findUnique({
            where: { id },
        })

        if (!withdrawal) {
            throw new Error('Withdrawal request not found')
        }

        if (withdrawal.status !== WithdrawalStatus.PENDING) {
            throw new Error('Withdrawal request already processed')
        }

        return prisma.$transaction(async (tx) => {
            const updatedWithdrawal = await tx.withdrawalRequest.update({
                where: { id },
                data: {
                    status: WithdrawalStatus.REJECTED,
                    processedBy: adminId,
                    processedAt: new Date(),
                    adminNote,
                },
            })

            await tx.adminAuditLog.create({
                data: {
                    adminId,
                    action: 'REJECT_WITHDRAWAL',
                    targetUserId: withdrawal.userId,
                    note: `Từ chối rút tiền ${withdrawal.amount}$ - ${adminNote || ''}`,
                    metadata: { withdrawalId: withdrawal.id },
                },
            })

            return updatedWithdrawal
        })
    }
}


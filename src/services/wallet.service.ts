// DEPRECATED: This service used Wallet table which has been removed
// Now using User.balance directly for everything

import { prisma } from '@/lib/prisma'

export class WalletService {
    // Get balance from User.balance instead of Wallet
    static async getBalance(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        })
        return user?.balance ? Number(user.balance) : 0
    }

    // Get VIP level based on User.balance
    static async getUserVipLevel(userId: string) {
        const balance = await this.getBalance(userId)
        
        return await prisma.vipLevel.findFirst({
            where: {
                minBalance: { lte: balance },
                isActive: true
            },
            orderBy: { minBalance: 'desc' }
        })
    }

    // Other methods deprecated - use User.balance operations directly
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Sync Wallet.balance → User.balance
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all wallets
        const wallets = await prisma.wallet.findMany({
            include: {
                user: true
            }
        })

        let synced = 0
        const results = []

        for (const wallet of wallets) {
            try {
                const walletBalance = Number(wallet.balance)
                const currentUserBalance = Number(wallet.user.balance)

                // Update user balance = wallet balance
                await prisma.user.update({
                    where: { id: wallet.userId },
                    data: { balance: walletBalance }
                })

                synced++
                results.push({
                    userId: wallet.userId,
                    username: wallet.user.username,
                    oldBalance: currentUserBalance,
                    newBalance: walletBalance,
                    synced: true
                })
            } catch (error) {
                results.push({
                    userId: wallet.userId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${synced} users`,
            total: wallets.length,
            results
        })
    } catch (error) {
        console.error('Error syncing balance:', error)
        return NextResponse.json(
            { error: 'Failed to sync balance' },
            { status: 500 }
        )
    }
}


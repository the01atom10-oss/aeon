import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WalletService } from '@/services/wallet.service'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const cursor = searchParams.get('cursor') || undefined
        const take = parseInt(searchParams.get('take') || '20')

        const result = await WalletService.getTransactions(
            session.user.id,
            cursor,
            take
        )

        return NextResponse.json({
            success: true,
            data: {
                items: result.items.map((tx) => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount.toString(),
                    status: tx.status,
                    description: tx.description,
                    balanceBefore: tx.balanceBefore.toString(),
                    balanceAfter: tx.balanceAfter.toString(),
                    createdAt: tx.createdAt.toISOString(),
                })),
                nextCursor: result.nextCursor,
                hasMore: result.hasMore,
            },
        })
    } catch (error) {
        console.error('Transactions error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

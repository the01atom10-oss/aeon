import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user balance and completedOrders
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balance: true, completedOrders: true }
        })

        const balance = user?.balance ? Number(user.balance) : 0
        const completedOrders = user?.completedOrders || 0

        // Get VIP level based on balance
        const vipLevel = await prisma.vipLevel.findFirst({
            where: {
                minBalance: { lte: balance },
                isActive: true
            },
            orderBy: { minBalance: 'desc' }
        })

        return NextResponse.json({
            success: true,
            balance: balance,
            data: {
                balance: balance.toString(),
                completedOrders: completedOrders,
                vipLevel: vipLevel
                    ? {
                        name: vipLevel.name,
                        minBalance: Number(vipLevel.minBalance).toString(),
                        commissionRate: Number(vipLevel.commissionRate).toString(),
                        maxOrders: vipLevel.maxOrders,
                    }
                    : null,
            },
        })
    } catch (error) {
        console.error('Balance error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


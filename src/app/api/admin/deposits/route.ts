import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DepositService } from '@/services/deposit.service'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') as any

        const { deposits, total } = await DepositService.getAllDeposits(status)

        return NextResponse.json({
            success: true,
            data: { items: deposits, total },
        })
    } catch (error) {
        console.error('Get deposits error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


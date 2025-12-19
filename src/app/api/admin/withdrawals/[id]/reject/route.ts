import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WithdrawalService } from '@/services/withdrawal.service'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { adminNote } = body

        const withdrawal = await WithdrawalService.rejectWithdrawal(
            params.id,
            session.user.id,
            adminNote
        )

        return NextResponse.json({
            success: true,
            message: 'Withdrawal rejected successfully',
            data: withdrawal,
        })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        console.error('Reject withdrawal error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


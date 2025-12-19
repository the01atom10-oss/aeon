import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WithdrawalService } from '@/services/withdrawal.service'
import { withdrawalRequestSchema } from '@/lib/validators'
import { z } from 'zod'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const validatedData = withdrawalRequestSchema.parse(body)

        const withdrawal = await WithdrawalService.createWithdrawalRequest({
            userId: session.user.id,
            amount: validatedData.amount,
            withdrawalPin: validatedData.withdrawalPin,
            bankName: validatedData.bankName,
            bankAccount: validatedData.bankAccount,
            bankAccountName: validatedData.bankAccountName,
            note: validatedData.note,
        })

        return NextResponse.json({
            success: true,
            message: 'Yêu cầu rút tiền đã được tạo',
            data: withdrawal,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                },
                { status: 400 }
            )
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        console.error('Withdrawal error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { withdrawals, total } = await WithdrawalService.getUserWithdrawals(session.user.id)

        return NextResponse.json({
            success: true,
            data: { items: withdrawals, total },
        })
    } catch (error) {
        console.error('Get withdrawals error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


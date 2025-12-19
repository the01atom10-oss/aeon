import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DepositService } from '@/services/deposit.service'
import { depositRequestSchema } from '@/lib/validators'
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
        const validatedData = depositRequestSchema.parse(body)

        const deposit = await DepositService.createDepositRequest({
            userId: session.user.id,
            amount: validatedData.amount,
            paymentMethod: validatedData.paymentMethod,
            paymentProof: validatedData.paymentProof,
            note: validatedData.note,
        })

        return NextResponse.json({
            success: true,
            message: 'Yêu cầu nạp tiền đã được tạo',
            data: deposit,
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

        console.error('Deposit error:', error)
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

        const { deposits, total } = await DepositService.getUserDeposits(session.user.id)

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


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services/user.service'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const resetWithdrawalPinSchema = z.object({
    newPin: z.string().min(6, 'Mã rút vốn phải có ít nhất 6 ký tự').regex(/^[0-9]+$/, 'Mã rút vốn chỉ được chứa số'),
})

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATOR) {
            return NextResponse.json(
                { success: false, message: 'Forbidden' },
                { status: 403 }
            )
        }

        const body = await req.json()
        const validatedData = resetWithdrawalPinSchema.parse(body)

        await UserService.resetWithdrawalPin(params.id, validatedData.newPin)

        return NextResponse.json({
            success: true,
            message: 'Mã rút vốn đã được đặt lại thành công',
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

        console.error('Reset withdrawal pin error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


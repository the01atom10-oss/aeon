import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services/user.service'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
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
        const validatedData = resetPasswordSchema.parse(body)

        await UserService.resetPassword(params.id, validatedData.newPassword)

        return NextResponse.json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công',
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

        console.error('Reset password error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


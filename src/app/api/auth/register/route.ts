import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/user.service'
import { registerSchema } from '@/lib/validators'
import { z } from 'zod'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate input
        const validatedData = registerSchema.parse(body)

        // Chuẩn hóa số điện thoại (loại bỏ khoảng trắng)
        const normalizedPhone = validatedData.phone.replace(/\s+/g, '')

        // Chuẩn hóa mã giới thiệu (uppercase, trim)
        const normalizedReferralCode = validatedData.referralCode.trim().toUpperCase()

        // Create user
        const user = await UserService.createUser({
            username: validatedData.username,
            email: validatedData.email || undefined,
            phone: normalizedPhone,
            password: validatedData.password,
            withdrawalPin: validatedData.withdrawalPin,
            referralCode: normalizedReferralCode, // Mã giới thiệu bắt buộc (đã chuẩn hóa)
        })

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            },
            { status: 201 }
        )
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
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            )
        }

        console.error('Registration error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        )
    }
}

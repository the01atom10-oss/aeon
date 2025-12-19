import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services/user.service'
import { UserRole } from '@prisma/client'

export async function GET(
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

        const user = await UserService.getUserById(params.id)

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                inviteCode: user.inviteCode,
                referredBy: user.referredBy,
                balance: user.balance ? user.balance.toString() : '0',
                hasPassword: !!user.passwordHash,
                hasWithdrawalPin: !!user.withdrawalPinHash,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
        })
    } catch (error) {
        console.error('Get user detail error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
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
        const { email, phone, role, status, inviteCode } = body

        const updatedUser = await UserService.updateUser(params.id, {
            email,
            phone,
            role,
            status,
            inviteCode,
        })

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        console.error('Update user error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'

// POST - Đổi mật khẩu
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
                { status: 400 }
            )
        }

        // Get user with password hash
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                passwordHash: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Mật khẩu hiện tại không đúng' },
                { status: 400 }
            )
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                passwordHash: newPasswordHash
            }
        })

        return NextResponse.json({ success: true, message: 'Đã đổi mật khẩu thành công' })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

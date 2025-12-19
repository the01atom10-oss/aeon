import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy thông tin profile của user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                inviteCode: true,
                referredBy: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT - Cập nhật thông tin profile
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { email, phone } = body

        // Validate email format if provided
        if (email && email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Email không hợp lệ' },
                    { status: 400 }
                )
            }

            // Check if email is already taken by another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: email,
                    id: { not: session.user.id }
                }
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email đã được sử dụng bởi người dùng khác' },
                    { status: 400 }
                )
            }
        }

        // Check if phone is already taken by another user
        if (phone && phone.trim() !== '') {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone: phone,
                    id: { not: session.user.id }
                }
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Số điện thoại đã được sử dụng bởi người dùng khác' },
                    { status: 400 }
                )
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                email: email && email.trim() !== '' ? email : null,
                phone: phone && phone.trim() !== '' ? phone : null
            },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                inviteCode: true,
                referredBy: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services/user.service'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user is admin or operator
        if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATOR) {
            return NextResponse.json(
                { success: false, message: 'Forbidden' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get('query') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const { users, total } = await UserService.searchUsers(query, skip, limit)

        return NextResponse.json({
            success: true,
            data: {
                users: users.map((user) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    balance: user.balance ? user.balance.toString() : '0',
                    inviteCode: user.inviteCode,
                    referralCode: user.referralCode, // Mã giới thiệu do admin cấp
                    createdAt: user.createdAt.toISOString(),
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
        })
    } catch (error) {
        console.error('Admin users error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
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
        const { username, email, phone, password, withdrawalPin, role, inviteCode, referralCode } = body

        // Validate required fields
        if (!username || !password || !withdrawalPin) {
            return NextResponse.json(
                { success: false, message: 'Username, password và mã rút vốn là bắt buộc' },
                { status: 400 }
            )
        }

        // Admin tạo user phải có referralCode (mã giới thiệu do admin cấp)
        // Có thể dùng mã giới thiệu của chính admin hoặc mã khác đã tồn tại
        if (!referralCode) {
            // Nếu không có referralCode, dùng inviteCode của admin hiện tại làm referralCode
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { inviteCode: true, referralCode: true }
            })
            
            if (!admin || (!admin.inviteCode && !admin.referralCode)) {
                return NextResponse.json(
                    { success: false, message: 'Mã giới thiệu là bắt buộc. Vui lòng nhập mã giới thiệu hợp lệ.' },
                    { status: 400 }
                )
            }
            
            // Sử dụng mã của admin làm referralCode
            const finalReferralCode = admin.referralCode || admin.inviteCode || ''
            
            const user = await UserService.createUser({
                username,
                email: email || undefined,
                phone: phone || undefined,
                password,
                withdrawalPin,
                referralCode: finalReferralCode,
                inviteCode: inviteCode || undefined,
                role: role || UserRole.USER,
            })
            
            return NextResponse.json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    inviteCode: user.inviteCode,
                    referralCode: user.referralCode,
                },
            })
        }

        // Create user với referralCode được chỉ định
        const user = await UserService.createUser({
            username,
            email: email || undefined,
            phone: phone || undefined,
            password,
            withdrawalPin,
            referralCode, // Mã giới thiệu bắt buộc
            inviteCode: inviteCode || undefined,
            role: role || UserRole.USER,
        })

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                inviteCode: user.inviteCode,
                referralCode: user.referralCode,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        console.error('Create user error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
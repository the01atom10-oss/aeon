import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        const { shopGroupId } = body

        if (!shopGroupId) {
            return NextResponse.json(
                { error: 'Shop group ID is required' },
                { status: 400 }
            )
        }

        // Lấy thông tin shop group
        const shopGroup = await prisma.shopGroup.findUnique({
            where: { id: shopGroupId },
            include: {
                vipLevel: true
            }
        })

        if (!shopGroup) {
            return NextResponse.json(
                { error: 'Shop group not found' },
                { status: 404 }
            )
        }

        // Tạo tin nhắn chat tự động
        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: session.user.id,
                message: `Tài khoản ${session.user.username} đã chọn gian hàng ${shopGroup.name}`,
                isAdmin: false
            }
        })

        // Gửi thông báo đến admin
        await prisma.notification.create({
            data: {
                title: 'Chọn gian hàng',
                message: `Tài khoản ${session.user.username} đã chọn gian hàng ${shopGroup.name}`,
                type: 'INFO',
                createdBy: 'SYSTEM'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Shop group selected successfully',
            data: {
                shopGroup: {
                    id: shopGroup.id,
                    name: shopGroup.name,
                    description: shopGroup.description
                },
                chatMessageId: chatMessage.id
            }
        })
    } catch (error) {
        console.error('Select shop group error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy danh sách thông báo của user (bao gồm broadcast)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Lấy notifications cho user này hoặc broadcast (userId = null)
        // Query riêng biệt để tránh lỗi với null
        const userNotifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const broadcastNotifications = await prisma.notification.findMany({
            where: {
                userId: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Merge và sort
        const notifications = [...userNotifications, ...broadcastNotifications]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 50)

        // Đếm số unread
        const userUnread = await prisma.notification.count({
            where: {
                userId: session.user.id,
                status: 'UNREAD'
            }
        })

        const broadcastUnread = await prisma.notification.count({
            where: {
                userId: null,
                status: 'UNREAD'
            }
        })

        const unreadCount = userUnread + broadcastUnread

        return NextResponse.json({
            notifications,
            unreadCount
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


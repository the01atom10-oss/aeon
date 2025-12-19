import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Đánh dấu notification là đã đọc
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify notification belongs to user or is broadcast
        const notification = await prisma.notification.findFirst({
            where: {
                id: params.id,
                OR: [
                    { userId: { equals: session.user.id } },
                    { userId: { equals: null } }
                ]
            }
        })

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            )
        }

        // Mark as read
        await prisma.notification.update({
            where: { id: params.id },
            data: { status: 'READ' }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


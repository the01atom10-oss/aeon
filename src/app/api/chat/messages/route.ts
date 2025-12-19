import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get messages for the current user
        const messages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null } // Admin broadcast messages
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: 100,
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        })

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            sender: msg.isAdmin ? 'admin' : 'user',
            message: msg.message,
            timestamp: msg.createdAt,
            senderName: msg.isAdmin ? 'Admin' : msg.user?.username
        }))

        return NextResponse.json({ messages: formattedMessages })
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}



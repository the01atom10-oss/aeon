import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all chat messages (admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.chatMessage.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 200,
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({ messages })
    } catch (error) {
        console.error('Error fetching chat messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}

// Send message as admin
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message, userId } = await req.json()

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        // Create admin message
        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: userId || null, // null for broadcast messages
                message: message.trim(),
                isAdmin: true
            }
        })

        return NextResponse.json({ 
            success: true,
            message: chatMessage
        })
    } catch (error) {
        console.error('Error sending admin message:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}



import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message } = await req.json()

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        if (message.length > 500) {
            return NextResponse.json(
                { error: 'Message is too long' },
                { status: 400 }
            )
        }

        // Create new message
        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: session.user.id,
                message: message.trim(),
                isAdmin: false
            }
        })

        return NextResponse.json({ 
            success: true,
            message: chatMessage
        })
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}



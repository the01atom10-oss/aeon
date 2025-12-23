import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canChat, canDeleteChat } from '@/lib/admin-permissions'

// Get all chat messages (admin cấp 1 và cấp 2 đều có thể xem)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || !canChat(session.user)) {
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

// Send message as admin (admin cấp 1 và cấp 2 đều có thể gửi)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || !canChat(session.user)) {
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

// DELETE - Xóa nhiều tin nhắn hoặc xóa tất cả (CHỈ admin cấp 1)
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        // Chỉ admin cấp 1 mới được xóa chat
        if (!session?.user || !canDeleteChat(session.user)) {
            return NextResponse.json(
                { 
                    error: 'Unauthorized', 
                    message: 'Chỉ admin cấp 1 mới có quyền xóa tin nhắn' 
                },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { messageIds, deleteAll } = body

        if (deleteAll === true) {
            // Xóa tất cả tin nhắn
            const result = await prisma.chatMessage.deleteMany({})
            return NextResponse.json({ 
                success: true,
                message: `Đã xóa ${result.count} tin nhắn`,
                deletedCount: result.count
            })
        } else if (Array.isArray(messageIds) && messageIds.length > 0) {
            // Xóa các tin nhắn đã chọn
            const result = await prisma.chatMessage.deleteMany({
                where: {
                    id: {
                        in: messageIds
                    }
                }
            })
            return NextResponse.json({ 
                success: true,
                message: `Đã xóa ${result.count} tin nhắn`,
                deletedCount: result.count
            })
        } else {
            return NextResponse.json(
                { error: 'Invalid request. Provide messageIds array or deleteAll: true' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error deleting chat messages:', error)
        return NextResponse.json(
            { error: 'Failed to delete chat messages' },
            { status: 500 }
        )
    }
}



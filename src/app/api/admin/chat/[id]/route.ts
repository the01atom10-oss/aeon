import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canDeleteChat } from '@/lib/admin-permissions'

// DELETE - Xóa chat message (CHỈ admin cấp 1)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        // Chỉ admin cấp 1 mới được xóa chat
        if (!session?.user || !canDeleteChat(session.user)) {
            return NextResponse.json(
                { 
                    error: 'Unauthorized', 
                    message: 'Chỉ admin cấp 1 mới có quyền xóa chat' 
                },
                { status: 403 }
            )
        }

        await prisma.chatMessage.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ 
            success: true,
            message: 'Chat message deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting chat message:', error)
        return NextResponse.json(
            { error: 'Failed to delete chat message' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canDeleteAuditLogs } from '@/lib/admin-permissions'

// DELETE - Xóa audit log (CHỈ admin cấp 1)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        // Chỉ admin cấp 1 mới được xóa audit logs
        if (!session?.user || !canDeleteAuditLogs(session.user)) {
            return NextResponse.json(
                { 
                    error: 'Unauthorized', 
                    message: 'Chỉ admin cấp 1 mới có quyền xóa audit logs' 
                },
                { status: 403 }
            )
        }

        await prisma.adminAuditLog.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ 
            success: true,
            message: 'Audit log deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting audit log:', error)
        return NextResponse.json(
            { error: 'Failed to delete audit log' },
            { status: 500 }
        )
    }
}


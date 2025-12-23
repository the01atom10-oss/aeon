import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminService } from '@/services/admin.service'
import { UserRole } from '@prisma/client'
import { isAdmin } from '@/lib/admin-permissions'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Chỉ admin mới có thể xem audit logs (cả cấp 1 và cấp 2)
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const { logs, total } = await AdminService.getAuditLogs(skip, limit)

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          admin: {
            username: log.admin.username,
            email: log.admin.email,
          },
          targetUser: log.targetUser
            ? {
                username: log.targetUser.username,
                email: log.targetUser.email,
              }
            : null,
          beforeBalance: log.beforeBalance?.toString(),
          afterBalance: log.afterBalance?.toString(),
          note: log.note,
          createdAt: log.createdAt.toISOString(),
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
    console.error('Admin audit logs error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

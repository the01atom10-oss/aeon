import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminService } from '@/services/admin.service'
import { UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view VIP levels
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATOR) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const vipLevels = await AdminService.getVipLevels()

    return NextResponse.json({
      success: true,
      data: vipLevels.map((level) => ({
        id: level.id,
        name: level.name,
        minBalance: level.minBalance.toString(),
        commissionRate: level.commissionRate.toString(),
        isActive: level.isActive,
        sortOrder: level.sortOrder,
      })),
    })
  } catch (error) {
    console.error('Admin VIP levels error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const vipLevel = await AdminService.createVipLevel(body)

    return NextResponse.json({
      success: true,
      data: vipLevel,
    })
  } catch (error) {
    console.error('Create VIP level error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

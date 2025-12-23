import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OrderApprovalService } from '@/services/order-approval.service'
import { canApproveOrders } from '@/lib/admin-permissions'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Admin cấp 1 và cấp 2 đều có thể quản lý cài đặt duyệt đơn
        if (!session?.user || !canApproveOrders(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const autoApproveAll = await OrderApprovalService.isAutoApproveAllEnabled()
        const threshold = await OrderApprovalService.getAutoApproveThreshold()

        return NextResponse.json({
            success: true,
            data: {
                autoApproveAll,
                autoApproveThreshold: threshold
            }
        })
    } catch (error) {
        console.error('Get approval settings error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Admin cấp 1 và cấp 2 đều có thể quản lý cài đặt duyệt đơn
        if (!session?.user || !canApproveOrders(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { autoApproveAll, autoApproveThreshold } = body

        if (typeof autoApproveAll === 'boolean') {
            await OrderApprovalService.setAutoApproveAll(autoApproveAll, session.user.id)
        }

        if (typeof autoApproveThreshold === 'number') {
            await OrderApprovalService.setAutoApproveThreshold(autoApproveThreshold, session.user.id)
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        })
    } catch (error) {
        console.error('Update approval settings error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


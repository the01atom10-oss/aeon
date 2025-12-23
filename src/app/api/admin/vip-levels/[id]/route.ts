import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-permissions'

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !isAdmin(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const vipLevelId = params.id
        const body = await req.json()
        const { 
            name, 
            minBalance, 
            commissionRate, 
            maxOrders, 
            autoApproveLimit,
            isActive, 
            sortOrder 
        } = body

        // Validate required fields
        if (minBalance === undefined || commissionRate === undefined) {
            return NextResponse.json(
                { error: 'minBalance and commissionRate are required' },
                { status: 400 }
            )
        }

        const vipLevel = await prisma.vipLevel.update({
            where: { id: vipLevelId },
            data: {
                ...(name && { name }),
                minBalance: Number(minBalance),
                commissionRate: Number(commissionRate),
                ...(maxOrders !== undefined && { maxOrders: Number(maxOrders) }),
                ...(autoApproveLimit !== undefined && { autoApproveLimit: Number(autoApproveLimit) }),
                ...(isActive !== undefined && { isActive }),
                ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) })
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                id: vipLevel.id,
                name: vipLevel.name,
                minBalance: vipLevel.minBalance.toString(),
                commissionRate: vipLevel.commissionRate.toString(),
                maxOrders: vipLevel.maxOrders,
                autoApproveLimit: vipLevel.autoApproveLimit,
                isActive: vipLevel.isActive,
                sortOrder: vipLevel.sortOrder
            }
        })
    } catch (error: any) {
        console.error('Update VIP level error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'VIP level not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


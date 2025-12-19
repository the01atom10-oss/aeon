import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const taskRuns = await prisma.taskRun.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                taskProduct: {
                    select: {
                        name: true,
                        imageUrl: true,
                        basePrice: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Format numbers for JSON
        const formattedTaskRuns = taskRuns.map(tr => ({
            ...tr,
            assignedPrice: tr.assignedPrice ? Number(tr.assignedPrice) : null,
            commissionRate: tr.commissionRate ? Number(tr.commissionRate) : null,
            rewardAmount: tr.rewardAmount ? Number(tr.rewardAmount) : null,
            totalRefund: tr.totalRefund ? Number(tr.totalRefund) : null,
            taskProduct: tr.taskProduct ? {
                ...tr.taskProduct,
                basePrice: Number(tr.taskProduct.basePrice)
            } : null
        }))

        return NextResponse.json({ taskRuns: formattedTaskRuns })
    } catch (error) {
        console.error('Error fetching task history:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


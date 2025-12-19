import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy danh sách task runs
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const state = searchParams.get('state')

        const where: any = {}
        if (state && state !== 'ALL') {
            where.state = state
        }

        const taskRuns = await prisma.taskRun.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                taskProduct: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        imageUrl: true,
                        basePrice: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        // Convert Decimal to number
        const formattedTaskRuns = taskRuns.map(run => ({
            ...run,
            assignedPrice: run.assignedPrice ? Number(run.assignedPrice) : 0,
            commissionRate: run.commissionRate ? Number(run.commissionRate) : 0,
            rewardAmount: run.rewardAmount ? Number(run.rewardAmount) : 0,
            totalRefund: run.totalRefund ? Number(run.totalRefund) : 0,
            taskProduct: run.taskProduct ? {
                ...run.taskProduct,
                price: Number(run.taskProduct.basePrice)
            } : null
        }))

        return NextResponse.json({
            success: true,
            taskRuns: formattedTaskRuns
        })

    } catch (error) {
        console.error('Get task runs error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch task runs' },
            { status: 500 }
        )
    }
}


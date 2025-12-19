import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST - Admin hoàn thành đơn hàng (hoàn trả tiền + hoa hồng)
export async function POST(req: NextRequest) {
    try {
        console.log('🚀 [COMPLETE TASK] Begin request')
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            console.log('❌ [COMPLETE TASK] Unauthorized')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        console.log('📝 [COMPLETE TASK] Request body:', body)
        const { taskRunId, runId } = body

        const id = taskRunId || runId

        if (!id) {
            console.log('❌ [COMPLETE TASK] Missing taskRunId')
            return NextResponse.json(
                { error: 'Task run ID is required' },
                { status: 400 }
            )
        }

        console.log(`🔍 [COMPLETE TASK] Looking for task run: ${id}`)

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get task run
            const taskRun = await tx.taskRun.findUnique({
                where: { id },
                include: {
                    task: { include: { vipLevel: true } },
                    taskProduct: true,
                    user: {
                        select: {
                            id: true,
                            balance: true,
                            freeSpins: true
                        }
                    }
                }
            })

            console.log(`📋 [COMPLETE TASK] Task run found:`, taskRun ? `State: ${taskRun.state}, Price: ${taskRun.assignedPrice}` : 'NULL')

            if (!taskRun) {
                console.log('❌ [COMPLETE TASK] Task run not found')
                throw new Error('Task run not found')
            }

            console.log(`📊 [COMPLETE TASK] Current state: ${taskRun.state}`)
            console.log(`💰 [COMPLETE TASK] User balance: ${taskRun.user.balance}, freeSpins: ${taskRun.user.freeSpins || 0}`)
            console.log(`💵 [COMPLETE TASK] Total refund: ${taskRun.totalRefund}`)

            if (taskRun.state !== 'ASSIGNED' && taskRun.state !== 'SUBMITTED') {
                console.log(`❌ [COMPLETE TASK] Wrong state: ${taskRun.state}, expected: ASSIGNED or SUBMITTED`)
                throw new Error(`Task run is not in ASSIGNED/SUBMITTED state (current: ${taskRun.state})`)
            }

            const currentBalance = Number(taskRun.user.balance)
            const totalRefund = Number(taskRun.totalRefund)
            const newBalance = currentBalance + totalRefund

            // Refund balance (original + commission) + tặng 1 lượt quay
            const currentFreeSpins = taskRun.user.freeSpins || 0
            const newFreeSpins = currentFreeSpins + 1
            
            console.log(`🎁 [COMPLETE TASK] Adding free spin: ${currentFreeSpins} -> ${newFreeSpins}`)
            
            await tx.user.update({
                where: { id: taskRun.userId },
                data: { 
                    balance: newBalance,
                    freeSpins: newFreeSpins // Tặng 1 lượt quay miễn phí
                }
            })
            
            console.log(`✅ [COMPLETE TASK] User updated: balance=${newBalance}, freeSpins=${newFreeSpins}`)

            // Create credit transaction
            await tx.transaction.create({
                data: {
                    userId: taskRun.userId,
                    type: 'REWARD',
                    amount: totalRefund,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    description: `Hoàn thành đơn: ${taskRun.taskProduct?.name || 'Sản phẩm'} (Gốc: $${Number(taskRun.assignedPrice).toLocaleString()} + Hoa hồng: $${Number(taskRun.rewardAmount).toLocaleString()})`,
                    status: 'POSTED',
                    idempotencyKey: `task-complete-${taskRunId}-${nanoid()}`,
                    referenceId: taskRunId,
                    createdBy: session.user.id,
                    metadata: {
                        taskRunId: taskRun.id,
                        taskId: taskRun.taskId,
                        productId: taskRun.taskProductId,
                        productName: taskRun.taskProduct?.name,
                        assignedPrice: Number(taskRun.assignedPrice),
                        rewardAmount: Number(taskRun.rewardAmount),
                        totalRefund: Number(taskRun.totalRefund)
                    }
                }
            })

            // Update task run state
            const updatedTaskRun = await tx.taskRun.update({
                where: { id },
                data: {
                    state: 'COMPLETED',
                    completedAt: new Date()
                },
                include: {
                    task: { include: { vipLevel: true } },
                    taskProduct: true,
                    user: {
                        select: {
                            id: true,
                            balance: true,
                            freeSpins: true
                        }
                    }
                }
            })

            console.log(`✅ [COMPLETE TASK] Task run updated to COMPLETED`)
            return { updatedTaskRun, newBalance }
        })
        
        console.log(`🎉 [COMPLETE TASK] Success!`)

        return NextResponse.json({
            success: true,
            taskRun: result.updatedTaskRun,
            newBalance: result.newBalance,
            message: 'Đơn hàng đã hoàn thành!'
        })

    } catch (error: any) {
        console.error('❌ [COMPLETE TASK] Error:', error)
        console.error('❌ [COMPLETE TASK] Error message:', error?.message)
        console.error('❌ [COMPLETE TASK] Error stack:', error?.stack)
        return NextResponse.json(
            { 
                error: error.message || 'Failed to complete task',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
        )
    }
}


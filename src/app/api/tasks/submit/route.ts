import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST - Gửi đơn hàng (trừ tiền)
export async function POST(req: NextRequest) {
    try {
        console.log('🚀 [SUBMIT TASK] Begin request')
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            console.log('❌ [SUBMIT TASK] Unauthorized - no session')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        console.log('📝 [SUBMIT TASK] Request body:', body)
        
        const { runId, taskRunId } = body
        const id = runId || taskRunId // Accept both field names

        if (!id) {
            console.log('❌ [SUBMIT TASK] Missing runId/taskRunId')
            return NextResponse.json(
                { error: 'Task run ID is required' },
                { status: 400 }
            )
        }

        console.log(`🔍 [SUBMIT TASK] Looking for task run: ${id}`)

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get task run
            const taskRun = await tx.taskRun.findUnique({
                where: { id },
                include: {
                    task: { include: { vipLevel: true } },
                    taskProduct: true
                }
            })

            console.log('📋 [SUBMIT TASK] Task run found:', taskRun ? `State: ${taskRun.state}, Price: ${taskRun.assignedPrice}` : 'NULL')

            if (!taskRun) {
                console.log('❌ [SUBMIT TASK] Task run not found')
                throw new Error('Task run not found')
            }

            if (taskRun.userId !== session.user.id) {
                console.log('❌ [SUBMIT TASK] Unauthorized - wrong user')
                throw new Error('Unauthorized')
            }

            if (taskRun.state !== 'STARTED' && taskRun.state !== 'ASSIGNED') {
                console.log(`❌ [SUBMIT TASK] Wrong state: ${taskRun.state}`)
                throw new Error(`Task run is not in STARTED/ASSIGNED state (current: ${taskRun.state})`)
            }

            // Get user balance
            const user = await tx.user.findUnique({
                where: { id: session.user.id }
            })

            console.log('👤 [SUBMIT TASK] User found:', user ? `Balance: ${user.balance}` : 'NULL')

            if (!user) {
                console.log('❌ [SUBMIT TASK] User not found')
                throw new Error('User not found')
            }

            const currentBalance = Number(user.balance)
            const assignedPrice = Number(taskRun.assignedPrice)

            console.log(`💰 [SUBMIT TASK] Balance check: Current=${currentBalance}, Required=${assignedPrice}`)

            // Check if user has enough balance
            if (currentBalance < assignedPrice) {
                console.log(`❌ [SUBMIT TASK] Insufficient balance`)
                throw new Error(`Không đủ số dư. Cần $${assignedPrice.toLocaleString()}, hiện có $${currentBalance.toLocaleString()}`)
            }

            // Deduct balance
            const newBalance = currentBalance - assignedPrice

            await tx.user.update({
                where: { id: session.user.id },
                data: { balance: newBalance }
            })

            // Create debit transaction
            await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    type: 'DEBIT',
                    amount: -assignedPrice,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    description: `Giật đơn: ${taskRun.taskProduct?.name || 'Sản phẩm'}`,
                    status: 'POSTED',
                    idempotencyKey: `task-submit-${taskRunId}-${nanoid()}`,
                    referenceId: taskRunId,
                    metadata: {
                        taskRunId: taskRun.id,
                        taskId: taskRun.taskId,
                        productId: taskRun.taskProductId,
                        productName: taskRun.taskProduct?.name
                    }
                }
            })

            // Kiểm tra xem có cần duyệt thủ công hay không
            const { OrderApprovalService } = await import('@/services/order-approval.service')
            const approvalRequired = await OrderApprovalService.shouldRequireManualApproval(
                session.user.id,
                assignedPrice
            )

            // Update task run state
            console.log(`💾 [SUBMIT TASK] Updating task run state to SUBMITTED, approvalRequired: ${approvalRequired}`)
            const updatedTaskRun = await tx.taskRun.update({
                where: { id },
                data: {
                    state: 'SUBMITTED',
                    submittedAt: new Date(),
                    approvalRequired
                },
                include: {
                    task: { include: { vipLevel: true } },
                    taskProduct: true,
                    user: {
                        select: {
                            completedOrders: true
                        }
                    }
                }
            })

            // Nếu không cần duyệt, tự động complete
            if (!approvalRequired) {
                console.log(`✅ [SUBMIT TASK] Auto-approving order (no manual approval required)`)
                const totalRefund = Number(updatedTaskRun.totalRefund)
                
                // Lấy balance hiện tại của user
                const currentUser = await tx.user.findUnique({
                    where: { id: session.user.id },
                    select: { balance: true, freeSpins: true, completedOrders: true }
                })
                
                const currentBalance = Number(currentUser?.balance || 0)
                const newBalance = currentBalance + totalRefund
                const currentFreeSpins = currentUser?.freeSpins || 0
                const currentCompletedOrders = currentUser?.completedOrders || 0

                console.log(`📊 [SUBMIT TASK] Current completedOrders: ${currentCompletedOrders}, will increment to ${currentCompletedOrders + 1}`)

                // Cập nhật balance và completedOrders (dùng increment để tránh race condition)
                await tx.user.update({
                    where: { id: session.user.id },
                    data: {
                        balance: newBalance,
                        completedOrders: { increment: 1 }, // Dùng increment thay vì + 1 để đảm bảo atomicity
                        freeSpins: { increment: 1 } // Dùng increment cho freeSpins cũng vậy
                    }
                })
                
                console.log(`✅ [SUBMIT TASK] User updated: balance=${newBalance}, completedOrders incremented, freeSpins incremented`)

                // Tạo transaction
                await tx.transaction.create({
                    data: {
                        userId: session.user.id,
                        type: 'REWARD',
                        amount: totalRefund,
                        balanceBefore: currentBalance,
                        balanceAfter: newBalance,
                        description: `Hoàn thành đơn tự động: ${updatedTaskRun.taskProduct?.name || 'Sản phẩm'}`,
                        status: 'POSTED',
                        idempotencyKey: `task-auto-complete-${id}-${Date.now()}`,
                        referenceId: id,
                        metadata: {
                            taskRunId: id,
                            autoApproved: true
                        }
                    }
                })

                // Cập nhật task run thành completed
                await tx.taskRun.update({
                    where: { id },
                    data: {
                        state: 'COMPLETED',
                        completedAt: new Date(),
                        approvedBy: 'SYSTEM',
                        approvedAt: new Date()
                    }
                })
            }

            // Decrease product stock
            if (taskRun.taskProductId) {
                await tx.taskProduct.update({
                    where: { id: taskRun.taskProductId },
                    data: {
                        stock: { decrement: 1 }
                    }
                })
            }

            return { updatedTaskRun, newBalance }
        })

        // Kiểm tra xem đơn đã được tự động duyệt chưa
        const finalTaskRun = await prisma.taskRun.findUnique({
            where: { id },
            select: { state: true, approvalRequired: true }
        })

        const message = finalTaskRun?.state === 'COMPLETED' 
            ? 'Đơn hàng đã được tự động duyệt và hoàn thành!'
            : 'Đã gửi đơn hàng thành công! Đang chờ admin duyệt...'

        return NextResponse.json({
            success: true,
            taskRun: result.updatedTaskRun,
            newBalance: result.newBalance,
            message,
            autoApproved: finalTaskRun?.state === 'COMPLETED'
        })

    } catch (error: any) {
        console.error('❌ [SUBMIT TASK] Error:', error)
        console.error('❌ [SUBMIT TASK] Error message:', error?.message)
        console.error('❌ [SUBMIT TASK] Error stack:', error?.stack)
        return NextResponse.json(
            { 
                success: false,
                error: error?.message || 'Failed to submit task',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
        )
    }
}


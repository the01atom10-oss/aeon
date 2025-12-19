import { prisma } from '@/lib/prisma'
import { TaskRunState, TransactionType } from '@prisma/client'
import { nanoid } from 'nanoid'

export class TaskService {
    /**
     * Start a new task run
     */
    static async startTask(userId: string, taskId: string) {
        const idempotencyKey = `task-start-${userId}-${taskId}-${Date.now()}-${nanoid()}`

        // Get task details
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { vipLevel: true },
        })

        if (!task || !task.isActive) {
            throw new Error('Task not found or inactive')
        }

        // Check user's VIP level based on balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        })

        if (!user) {
            throw new Error('User not found')
        }

        const userBalance = Number(user.balance)
        const userVipLevel = await prisma.vipLevel.findFirst({
            where: {
                minBalance: { lte: userBalance },
                isActive: true
            },
            orderBy: { minBalance: 'desc' }
        })

        // User must meet minimum VIP level requirement
        if (!userVipLevel) {
            throw new Error('Insufficient VIP level for this task')
        }
        
        const userVipMinBalance = Number(userVipLevel.minBalance)
        const taskVipMinBalance = Number(task.vipLevel.minBalance)
        if (userVipMinBalance < taskVipMinBalance) {
            throw new Error('Insufficient VIP level for this task')
        }

        // Create task run
        const taskRun = await prisma.taskRun.create({
            data: {
                userId,
                taskId,
                state: TaskRunState.STARTED,
                idempotencyKey,
            },
        })

        return taskRun
    }

    /**
     * Assign a task item to the run (simulate)
     */
    static async assignTaskItem(taskRunId: string) {
        const taskRun = await prisma.taskRun.findUnique({
            where: { id: taskRunId },
            include: { task: true },
        })

        if (!taskRun) {
            throw new Error('Task run not found')
        }

        if (taskRun.state !== TaskRunState.STARTED) {
            throw new Error('Task run is not in STARTED state')
        }

        // Simulate assignment (in real app, this would fetch actual product/item)
        const assignedPrice = taskRun.task.basePrice
        const rewardAmount = assignedPrice.mul(taskRun.task.rewardRate)

        const updated = await prisma.taskRun.update({
            where: { id: taskRunId },
            data: {
                state: TaskRunState.ASSIGNED,
                assignedPrice,
                rewardAmount,
                metadata: {
                    itemTitle: `Product ${nanoid(6)}`,
                    itemDescription: 'Review this product',
                },
            },
        })

        return updated
    }

    /**
     * Submit task completion and reward user
     */
    static async submitTask(taskRunId: string, userId: string) {
        // Check for duplicate submission
        const taskRun = await prisma.taskRun.findUnique({
            where: { id: taskRunId },
            include: { task: true, user: true },
        })

        if (!taskRun) {
            throw new Error('Task run not found')
        }

        if (taskRun.userId !== userId) {
            throw new Error('Unauthorized')
        }

        if (taskRun.state === TaskRunState.COMPLETED) {
            throw new Error('Task already completed')
        }

        if (taskRun.state !== TaskRunState.ASSIGNED && taskRun.state !== TaskRunState.SUBMITTED) {
            throw new Error('Task is not ready for submission')
        }

        if (!taskRun.rewardAmount) {
            throw new Error('Reward amount not set')
        }

        // Use task run idempotency key for transaction
        const txIdempotencyKey = `task-reward-${taskRunId}`

        // Credit reward to user
        await prisma.$transaction(async (tx) => {
            const currentUser = await tx.user.findUnique({
                where: { id: userId },
                select: { balance: true }
            })

            if (!currentUser) {
                throw new Error('User not found')
            }

            const balanceBefore = Number(currentUser.balance)
            const balanceAfter = balanceBefore + Number(taskRun.rewardAmount)

            // Update user balance
            await tx.user.update({
                where: { id: userId },
                data: { balance: balanceAfter }
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.REWARD,
                    amount: Number(taskRun.rewardAmount),
                    description: `Task reward: ${taskRun.task.name}`,
                    balanceBefore,
                    balanceAfter,
                    idempotencyKey: txIdempotencyKey,
                    referenceId: taskRunId,
                    status: 'POSTED'
                }
            })
        })

        // Mark task as completed
        const completed = await prisma.taskRun.update({
            where: { id: taskRunId },
            data: {
                state: TaskRunState.COMPLETED,
                completedAt: new Date(),
            },
        })

        return completed
    }

    /**
     * Get available tasks for user's VIP level
     */
    static async getAvailableTasks(userId: string) {
        // Get user balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        })

        if (!user) {
            console.log(`[TASK SERVICE] User not found: ${userId}`)
            return []
        }

        const userBalance = Number(user.balance)
        console.log(`[TASK SERVICE] User balance: ${userBalance}`)

        // Get all active tasks where user's balance >= task's required VIP level minBalance
        const tasks = await prisma.task.findMany({
            where: {
                isActive: true,
                vipLevel: {
                    minBalance: {
                        lte: userBalance, // User's balance must be >= task's required minBalance
                    },
                    isActive: true
                },
            },
            include: {
                vipLevel: true,
            },
            orderBy: {
                vipLevel: {
                    minBalance: 'desc', // Show higher VIP tasks first
                },
            },
        })

        console.log(`[TASK SERVICE] Found ${tasks.length} available tasks for user`)
        if (tasks.length > 0) {
            tasks.forEach((task, idx) => {
                console.log(`  ${idx + 1}. ${task.name} - VIP: ${task.vipLevel.name} (min: $${task.vipLevel.minBalance})`)
            })
        } else {
            console.log(`[TASK SERVICE] No tasks available. User balance: $${userBalance}`)
            // Check if there are any tasks at all
            const allTasks = await prisma.task.findMany({
                where: { isActive: true },
                include: { vipLevel: true }
            })
            console.log(`[TASK SERVICE] Total active tasks in DB: ${allTasks.length}`)
            if (allTasks.length > 0) {
                allTasks.forEach((task, idx) => {
                    console.log(`  ${idx + 1}. ${task.name} - VIP: ${task.vipLevel.name} (min: $${task.vipLevel.minBalance}) - User needs: $${task.vipLevel.minBalance}`)
                })
            }
        }

        return tasks
    }

    /**
     * Get user's task runs history
     */
    static async getUserTaskRuns(userId: string, skip = 0, take = 20) {
        const [taskRuns, total] = await Promise.all([
            prisma.taskRun.findMany({
                where: { userId },
                include: {
                    task: {
                        include: {
                            vipLevel: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.taskRun.count({ where: { userId } }),
        ])

        return { taskRuns, total }
    }
}

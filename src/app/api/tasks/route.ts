import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TaskService } from '@/services/task.service'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.log(`[API /tasks] Fetching tasks for user: ${session.user.id}`)
        
        const tasks = await TaskService.getAvailableTasks(session.user.id)

        console.log(`[API /tasks] Found ${tasks.length} tasks`)

        // Get user balance for better error message
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balance: true }
        })

        const response = {
            success: true,
            data: tasks.map((task) => ({
                id: task.id,
                name: task.name,
                description: task.description,
                basePrice: task.basePrice.toString(),
                rewardRate: task.rewardRate.toString(),
                vipLevel: {
                    name: task.vipLevel.name,
                    minBalance: task.vipLevel.minBalance.toString(),
                },
            })),
        }

        // Add helpful message if no tasks
        if (tasks.length === 0) {
            const userBalance = user?.balance ? Number(user.balance) : 0
            const allTasks = await prisma.task.findMany({
                where: { isActive: true },
                include: { vipLevel: true }
            })
            
            if (allTasks.length === 0) {
                response.message = 'Chưa có nhiệm vụ nào trong hệ thống. Vui lòng liên hệ admin.'
            } else {
                const minRequired = Math.min(...allTasks.map(t => Number(t.vipLevel.minBalance)))
                response.message = `Bạn cần nạp tối thiểu $${minRequired.toLocaleString()} để tham gia nhiệm vụ. Số dư hiện tại: $${userBalance.toLocaleString()}`
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Tasks error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

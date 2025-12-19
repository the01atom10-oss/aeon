import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TaskService } from '@/services/task.service'

export async function POST(
    req: NextRequest,
    { params }: { params: { runId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const runId = params.runId

        // Submit task and credit reward
        const completedTask = await TaskService.submitTask(runId, session.user.id)

        return NextResponse.json({
            success: true,
            message: 'Task completed successfully',
            data: {
                id: completedTask.id,
                state: completedTask.state,
                rewardAmount: completedTask.rewardAmount?.toString(),
                completedAt: completedTask.completedAt?.toISOString(),
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        console.error('Submit task error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

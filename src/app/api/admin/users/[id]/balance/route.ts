import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount, note } = await req.json()

        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: params.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentBalance = Number(user.balance)
        const newBalance = currentBalance + amount

        // Update balance in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user balance
            const updatedUser = await tx.user.update({
                where: { id: params.id },
                data: { balance: newBalance }
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: params.id,
                    type: amount > 0 ? 'CREDIT' : 'DEBIT',
                    amount: Math.abs(amount),
                    description: note || `Admin adjustment: ${amount > 0 ? '+' : ''}${amount}`,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    idempotencyKey: `admin-balance-${params.id}-${Date.now()}`,
                    createdBy: session.user.id
                }
            })

            return updatedUser
        })

        return NextResponse.json({
            success: true,
            newBalance: Number(result.balance),
            message: `Balance updated successfully`
        })
    } catch (error) {
        console.error('Error updating balance:', error)
        return NextResponse.json(
            { error: 'Failed to update balance' },
            { status: 500 }
        )
    }
}

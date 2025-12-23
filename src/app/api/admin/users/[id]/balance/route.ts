import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuditLogService } from '@/services/audit-log.service'
import { canApproveOrders } from '@/lib/admin-permissions'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        console.log('🔐 [BALANCE ADJUST] Session check:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            role: session?.user?.role,
            adminLevel: session?.user?.adminLevel,
        })

        // Sử dụng helper function để kiểm tra quyền
        if (!session?.user || !canApproveOrders(session.user)) {
            console.log('❌ [BALANCE ADJUST] Unauthorized - User does not have permission')
            return NextResponse.json(
                { 
                    error: 'Unauthorized',
                    message: 'Bạn không có quyền điều chỉnh số dư. Chỉ admin mới có quyền này.'
                },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { amount: rawAmount, note, type, description } = body

        console.log('📝 [BALANCE ADJUST] Request body:', { rawAmount, type, note, description })

        // Validate amount
        if (typeof rawAmount !== 'number' || rawAmount <= 0) {
            console.log('❌ [BALANCE ADJUST] Invalid amount:', rawAmount)
            return NextResponse.json(
                { error: 'Invalid amount. Amount must be a positive number.' },
                { status: 400 }
            )
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: params.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentBalance = Number(user.balance)
        
        console.log('💰 [BALANCE ADJUST] Current balance:', currentBalance)
        
        // Determine actual amount change based on type
        // If type is DEBIT, make amount negative; if CREDIT or undefined, keep positive
        const actualAmount = (type === 'DEBIT') ? -rawAmount : rawAmount
        const newBalance = currentBalance + actualAmount
        
        console.log('💵 [BALANCE ADJUST] Amount change:', { type, rawAmount, actualAmount, newBalance })
        
        // Check if balance would go negative (only for DEBIT)
        if (type === 'DEBIT' && newBalance < 0) {
            console.log('❌ [BALANCE ADJUST] Insufficient balance for debit')
            return NextResponse.json({ 
                error: `Không thể trừ tiền. Số dư hiện tại: $${currentBalance.toLocaleString('vi-VN')}, không đủ để trừ $${rawAmount.toLocaleString('vi-VN')}` 
            }, { status: 400 })
        }

        // Update balance in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user balance
            const updatedUser = await tx.user.update({
                where: { id: params.id },
                data: { balance: newBalance }
            })

            // Create transaction record
            const transactionType = type === 'DEBIT' ? 'DEBIT' : 'CREDIT'
            const transactionDescription = description || note || (type === 'DEBIT' 
                ? `Admin trừ tiền: -$${rawAmount.toLocaleString('vi-VN')}` 
                : `Admin cộng tiền: +$${rawAmount.toLocaleString('vi-VN')}`)
            
            await tx.transaction.create({
                data: {
                    userId: params.id,
                    type: transactionType,
                    amount: Math.abs(actualAmount), // Store absolute value
                    description: transactionDescription,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    idempotencyKey: `admin-balance-${params.id}-${Date.now()}`,
                    createdBy: session.user.id
                }
            })

            return updatedUser
        })

        // Tạo audit log cho hành động điều chỉnh số dư
        await AuditLogService.logBalanceAdjustment(
            session.user.id,
            params.id,
            actualAmount, // Use actualAmount (có thể âm) thay vì rawAmount
            currentBalance,
            newBalance,
            description || note || undefined
        )

        console.log('✅ [BALANCE ADJUST] Success! New balance:', Number(result.balance))

        return NextResponse.json({
            success: true,
            newBalance: Number(result.balance),
            message: `Balance updated successfully`
        })
    } catch (error: any) {
        console.error('❌ [BALANCE ADJUST] Error:', error)
        console.error('❌ [BALANCE ADJUST] Error message:', error?.message)
        console.error('❌ [BALANCE ADJUST] Error stack:', error?.stack)
        return NextResponse.json(
            { 
                error: error?.message || 'Failed to update balance',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
        )
    }
}

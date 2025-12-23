import { prisma } from '@/lib/prisma'

export interface CreateAuditLogInput {
    adminId: string
    action: string
    targetUserId?: string | null
    beforeBalance?: number | null
    afterBalance?: number | null
    note?: string | null
    metadata?: Record<string, any> | null
}

/**
 * Service để tạo audit log cho các hành động của admin
 */
export class AuditLogService {
    /**
     * Tạo audit log khi số dư user thay đổi
     */
    static async logBalanceChange(input: CreateAuditLogInput) {
        try {
            const auditLog = await prisma.adminAuditLog.create({
                data: {
                    adminId: input.adminId,
                    action: input.action,
                    targetUserId: input.targetUserId || null,
                    beforeBalance: input.beforeBalance !== undefined && input.beforeBalance !== null 
                        ? input.beforeBalance 
                        : null,
                    afterBalance: input.afterBalance !== undefined && input.afterBalance !== null 
                        ? input.afterBalance 
                        : null,
                    note: input.note || null,
                    metadata: input.metadata || undefined,
                },
            })

            console.log(`📝 [AUDIT LOG] Created: ${input.action} by admin ${input.adminId}`)
            return auditLog
        } catch (error) {
            console.error('❌ [AUDIT LOG] Error creating audit log:', error)
            // Không throw error để không làm gián đoạn flow chính
            // Chỉ log lỗi để debug
            return null
        }
    }

    /**
     * Tạo audit log cho hành động điều chỉnh số dư (Quick Balance)
     */
    static async logBalanceAdjustment(
        adminId: string,
        targetUserId: string,
        amount: number,
        beforeBalance: number,
        afterBalance: number,
        note?: string
    ) {
        return this.logBalanceChange({
            adminId,
            action: amount > 0 ? 'BALANCE_ADJUSTMENT_ADD' : 'BALANCE_ADJUSTMENT_SUBTRACT',
            targetUserId,
            beforeBalance,
            afterBalance,
            note: note || `Admin ${amount > 0 ? 'thêm' : 'trừ'} ${Math.abs(amount).toLocaleString('vi-VN')} credits`,
            metadata: {
                amount,
                adjustmentType: amount > 0 ? 'ADD' : 'SUBTRACT',
            },
        })
    }

    /**
     * Tạo audit log khi admin duyệt đơn hàng
     */
    static async logOrderApproval(
        adminId: string,
        targetUserId: string,
        taskRunId: string,
        beforeBalance: number,
        afterBalance: number,
        taskProductName?: string,
        totalRefund?: number
    ) {
        return this.logBalanceChange({
            adminId,
            action: 'ORDER_APPROVAL',
            targetUserId,
            beforeBalance,
            afterBalance,
            note: `Admin duyệt đơn hàng: ${taskProductName || 'Sản phẩm'}`,
            metadata: {
                taskRunId,
                taskProductName,
                totalRefund,
                balanceChange: afterBalance - beforeBalance,
            },
        })
    }

    /**
     * Tạo audit log cho các hành động khác
     */
    static async logAction(
        adminId: string,
        action: string,
        targetUserId?: string | null,
        note?: string,
        metadata?: Record<string, any>
    ) {
        return this.logBalanceChange({
            adminId,
            action,
            targetUserId: targetUserId || null,
            beforeBalance: null,
            afterBalance: null,
            note: note || null,
            metadata: metadata || undefined,
        })
    }
}


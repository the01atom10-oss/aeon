import { prisma } from '@/lib/prisma'

export class OrderApprovalService {
    /**
     * Kiểm tra xem đơn có cần duyệt thủ công hay không
     * @param userId ID của user
     * @param assignedPrice Giá của đơn
     * @returns true nếu cần duyệt thủ công, false nếu tự động duyệt
     */
    static async shouldRequireManualApproval(userId: string, assignedPrice: number): Promise<boolean> {
        // Lấy thông tin user và VIP level
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                taskRuns: {
                    where: { state: 'COMPLETED' },
                    select: { id: true }
                }
            }
        })

        if (!user) {
            return true // An toàn: yêu cầu duyệt nếu không tìm thấy user
        }

        // Lấy VIP level hiện tại của user
        const vipLevel = await prisma.vipLevel.findFirst({
            where: {
                minBalance: { lte: user.balance },
                isActive: true
            },
            orderBy: { minBalance: 'desc' }
        })

        if (!vipLevel) {
            return true // Không có VIP level thì yêu cầu duyệt
        }

        const completedOrders = user.completedOrders || 0

        // Kiểm tra công tắc bật/tắt và giờ cao điểm
        const autoApproveAll = await this.isAutoApproveAllEnabled()
        if (autoApproveAll) {
            return false // Tự động duyệt tất cả
        }

        // Kiểm tra mức giá tự động duyệt (nếu có) - ưu tiên cao nhất
        // Nếu giá dưới hạn mức thì tự động duyệt bất kể số đơn đã hoàn thành
        const autoApproveThreshold = await this.getAutoApproveThreshold()
        if (autoApproveThreshold && assignedPrice <= autoApproveThreshold) {
            return false // Tự động duyệt nếu giá dưới ngưỡng
        }

        // Kiểm tra số đơn đã hoàn thành với giới hạn tự động duyệt
        if (completedOrders < vipLevel.autoApproveLimit) {
            return false // Tự động duyệt nếu chưa vượt quá giới hạn
        }

        // Cần duyệt thủ công
        return true
    }

    /**
     * Kiểm tra xem có bật chế độ tự động duyệt tất cả (giờ cao điểm) không
     */
    static async isAutoApproveAllEnabled(): Promise<boolean> {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'auto_approve_all' }
        })
        return setting?.value === 'true'
    }

    /**
     * Lấy mức giá tự động duyệt
     */
    static async getAutoApproveThreshold(): Promise<number | null> {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'auto_approve_threshold' }
        })
        return setting ? parseFloat(setting.value) : null
    }

    /**
     * Cập nhật công tắc tự động duyệt tất cả
     */
    static async setAutoApproveAll(enabled: boolean, adminId: string) {
        await prisma.systemSettings.upsert({
            where: { key: 'auto_approve_all' },
            update: {
                value: enabled ? 'true' : 'false',
                updatedBy: adminId,
                updatedAt: new Date()
            },
            create: {
                key: 'auto_approve_all',
                value: enabled ? 'true' : 'false',
                description: 'Tự động duyệt tất cả đơn (giờ cao điểm)',
                updatedBy: adminId
            }
        })
    }

    /**
     * Cập nhật mức giá tự động duyệt
     */
    static async setAutoApproveThreshold(threshold: number, adminId: string) {
        await prisma.systemSettings.upsert({
            where: { key: 'auto_approve_threshold' },
            update: {
                value: threshold.toString(),
                updatedBy: adminId,
                updatedAt: new Date()
            },
            create: {
                key: 'auto_approve_threshold',
                value: threshold.toString(),
                description: 'Mức giá tự động duyệt (đơn dưới mức này sẽ tự động duyệt)',
                updatedBy: adminId
            }
        })
    }
}


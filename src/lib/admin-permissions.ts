import { UserRole, AdminLevel } from '@prisma/client'

export interface AdminUser {
    id: string
    role: UserRole
    adminLevel?: AdminLevel | null
}

/**
 * Kiểm tra xem user có phải admin cấp 1 không (toàn quyền)
 */
export function isAdminLevel1(user: AdminUser | null | undefined): boolean {
    if (!user) return false
    return user.role === 'ADMIN' && user.adminLevel === 'LEVEL_1'
}

/**
 * Kiểm tra xem user có phải admin cấp 2 không (quyền hạn chế)
 */
export function isAdminLevel2(user: AdminUser | null | undefined): boolean {
    if (!user) return false
    return user.role === 'ADMIN' && user.adminLevel === 'LEVEL_2'
}

/**
 * Kiểm tra xem user có phải admin không (bất kỳ cấp nào)
 */
export function isAdmin(user: AdminUser | null | undefined): boolean {
    if (!user) return false
    return user.role === 'ADMIN'
}

/**
 * Kiểm tra xem admin có quyền xóa dữ liệu không (chỉ admin cấp 1)
 */
export function canDeleteData(user: AdminUser | null | undefined): boolean {
    return isAdminLevel1(user)
}

/**
 * Kiểm tra xem admin có quyền xóa chat không (chỉ admin cấp 1)
 */
export function canDeleteChat(user: AdminUser | null | undefined): boolean {
    return isAdminLevel1(user)
}

/**
 * Kiểm tra xem admin có quyền xóa audit logs không (chỉ admin cấp 1)
 */
export function canDeleteAuditLogs(user: AdminUser | null | undefined): boolean {
    return isAdminLevel1(user)
}

/**
 * Kiểm tra xem admin có quyền quản lý cài đặt hệ thống không (chỉ admin cấp 1)
 */
export function canManageSystemSettings(user: AdminUser | null | undefined): boolean {
    return isAdminLevel1(user)
}

/**
 * Kiểm tra xem admin có quyền thêm/sửa/xóa sản phẩm không (cả cấp 1 và cấp 2)
 */
export function canManageProducts(user: AdminUser | null | undefined): boolean {
    return isAdmin(user)
}

/**
 * Kiểm tra xem admin có quyền duyệt đơn không (cả cấp 1 và cấp 2, và OPERATOR)
 */
export function canApproveOrders(user: AdminUser | null | undefined): boolean {
    if (!user) return false
    // Cho phép ADMIN (cả Level 1 và Level 2) và OPERATOR
    return user.role === 'ADMIN' || user.role === 'OPERATOR'
}

/**
 * Kiểm tra xem admin có quyền trao đổi chat không (cả cấp 1 và cấp 2)
 */
export function canChat(user: AdminUser | null | undefined): boolean {
    return isAdmin(user)
}


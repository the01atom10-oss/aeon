import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { nanoid } from '@/lib/nanoid'

export interface CreateUserInput {
    username: string
    email?: string
    phone?: string
    password: string
    withdrawalPin: string
    referralCode: string  // Mã giới thiệu do admin cấp (bắt buộc)
    inviteCode?: string    // Mã mời của user (tự động tạo)
    role?: UserRole
}

export class UserService {
    /**
     * Generate a unique 7-digit numeric invite code
     */
    static async generateInviteCode(): Promise<string> {
        let inviteCode: string = ''
        let isUnique = false
        let attempts = 0
        const maxAttempts = 10

        while (!isUnique && attempts < maxAttempts) {
            // Generate 7-digit random number (1000000 - 9999999)
            inviteCode = Math.floor(1000000 + Math.random() * 9000000).toString()
            
            // Check if code already exists
            const existing = await prisma.user.findFirst({
                where: { inviteCode },
            })

            if (!existing) {
                isUnique = true
            } else {
                attempts++
            }
        }

        if (!isUnique) {
            // Fallback: generate another 7-digit number
            inviteCode = Math.floor(1000000 + Math.random() * 9000000).toString()
        }

        return inviteCode
    }

    static async createUser(input: CreateUserInput) {
        // Check if username exists
        const existingUsername = await prisma.user.findUnique({
            where: { username: input.username },
        })
        if (existingUsername) {
            throw new Error('Username already exists')
        }

        // Check if email exists (if provided)
        if (input.email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email: input.email },
            })
            if (existingEmail) {
                throw new Error('Email already exists')
            }
        }

        // Check if phone exists (if provided)
        if (input.phone) {
            // Chuẩn hóa số điện thoại trước khi kiểm tra
            const normalizedPhone = input.phone.replace(/\s+/g, '')
            const existingPhone = await prisma.user.findUnique({
                where: { phone: normalizedPhone },
            })
            if (existingPhone) {
                throw new Error('Số điện thoại đã được sử dụng')
            }
        }

        // Kiểm tra mã giới thiệu có tồn tại không (phải do admin cấp)
        if (!input.referralCode || input.referralCode.trim() === '') {
            throw new Error('Mã giới thiệu là bắt buộc')
        }

        // Chuẩn hóa mã giới thiệu (uppercase, trim)
        const normalizedReferralCode = input.referralCode.trim().toUpperCase()

        // Kiểm tra mã giới thiệu có tồn tại trong hệ thống không
        // Mã giới thiệu có thể là:
        // 1. referralCode của một user (do admin cấp)
        // 2. inviteCode của một user (mã mời tự động)
        const referralExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { referralCode: normalizedReferralCode },
                    { inviteCode: normalizedReferralCode }
                ]
            }
        })

        if (!referralExists) {
            throw new Error(`Mã giới thiệu "${normalizedReferralCode}" không tồn tại trong hệ thống. Vui lòng liên hệ admin để được cấp mã giới thiệu hợp lệ.`)
        }

        // Hash password and withdrawal pin
        const passwordHash = await bcrypt.hash(input.password, 10)
        const withdrawalPinHash = await bcrypt.hash(input.withdrawalPin, 10)

        // Generate invite code if not provided
        let inviteCode = input.inviteCode
        if (!inviteCode) {
            inviteCode = await this.generateInviteCode()
        } else {
            // Check if provided invite code already exists
            const existing = await prisma.user.findFirst({
                where: { inviteCode },
            })
            if (existing) {
                throw new Error('Invite code already exists')
            }
        }

        // Chuẩn hóa số điện thoại trước khi lưu
        const normalizedPhone = input.phone ? input.phone.replace(/\s+/g, '') : null

        // Create user
        const user = await prisma.user.create({
            data: {
                username: input.username,
                email: input.email,
                phone: normalizedPhone,
                passwordHash,
                withdrawalPinHash,
                role: input.role || UserRole.USER,
                status: UserStatus.ACTIVE,
                inviteCode,
                referralCode: normalizedReferralCode, // Mã giới thiệu do admin cấp (đã chuẩn hóa)
                referredBy: referralExists.id, // ID của người giới thiệu
                balance: 0, // Initialize balance to 0
                completedOrders: 0, // Khởi tạo số đơn đã hoàn thành
            },
        })

        return user
    }

    static async getUserById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
        })
    }

    static async getUserWithWallet(userId: string) {
        // Wallet removed - just return user with balance
        return prisma.user.findUnique({
            where: { id: userId },
        })
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new Error('User not found')
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isValid) {
            throw new Error('Current password is incorrect')
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        })
    }

    static async searchUsers(query?: string, skip = 0, take = 20) {
        const where = query
            ? {
                OR: [
                    { username: { contains: query, mode: 'insensitive' as const } },
                    { email: { contains: query, mode: 'insensitive' as const } },
                    { phone: { contains: query, mode: 'insensitive' as const } },
                ],
            }
            : {}

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            }),
            prisma.user.count({ where }),
        ])

        return { users, total }
    }

    static async updateUser(userId: string, data: {
        email?: string | null
        phone?: string | null
        role?: UserRole
        status?: UserStatus
        inviteCode?: string | null
    }) {
        return prisma.user.update({
            where: { id: userId },
            data,
        })
    }

    static async resetPassword(userId: string, newPassword: string) {
        const passwordHash = await bcrypt.hash(newPassword, 10)
        
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        })
    }

    static async resetWithdrawalPin(userId: string, newPin: string) {
        const withdrawalPinHash = await bcrypt.hash(newPin, 10)
        
        await prisma.user.update({
            where: { id: userId },
            data: { withdrawalPinHash },
        })
    }
}

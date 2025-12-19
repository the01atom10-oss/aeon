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
    inviteCode?: string
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
            const existingPhone = await prisma.user.findUnique({
                where: { phone: input.phone },
            })
            if (existingPhone) {
                throw new Error('Phone already exists')
            }
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

        // Create user
        const user = await prisma.user.create({
            data: {
                username: input.username,
                email: input.email,
                phone: input.phone,
                passwordHash,
                withdrawalPinHash,
                role: input.role || UserRole.USER,
                status: UserStatus.ACTIVE,
                inviteCode,
                balance: 0, // Initialize balance to 0
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

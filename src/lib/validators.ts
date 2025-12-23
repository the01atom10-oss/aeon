import { z } from 'zod'

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z
        .string()
        .min(1, 'Số điện thoại là bắt buộc')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
        .refine(
            (val) => {
                // Loại bỏ khoảng trắng
                const cleaned = val.replace(/\s+/g, '')
                // Kiểm tra format số điện thoại Việt Nam: 10 số, bắt đầu bằng 0
                // Các đầu số hợp lệ: 03, 05, 07, 08, 09
                return /^0[3|5|7|8|9][0-9]{8}$/.test(cleaned)
            },
            {
                message: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam 10 số (VD: 0912345678)',
            }
        ),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    withdrawalPin: z
        .string()
        .min(6, 'Mã rút vốn phải có ít nhất 6 ký tự')
        .regex(/^[0-9]+$/, 'Mã rút vốn chỉ được chứa số'),
    referralCode: z
        .string()
        .min(1, 'Mã giới thiệu là bắt buộc')
        .regex(/^[A-Z0-9]+$/, 'Mã giới thiệu chỉ được chứa chữ cái in hoa và số'),
})

export const loginSchema = z.object({
    username: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const adminBalanceAdjustmentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['CREDIT', 'DEBIT']),
    description: z.string().min(10, 'Description must be at least 10 characters'),
})

// Deposit and withdrawal schemas removed - functionality no longer available

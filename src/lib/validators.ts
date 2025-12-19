import { z } from 'zod'

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().min(1, 'Số điện thoại là bắt buộc').regex(/^[0-9+\-() ]+$/, 'Số điện thoại không hợp lệ'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    withdrawalPin: z
        .string()
        .min(6, 'Mã rút vốn phải có ít nhất 6 ký tự')
        .regex(/^[0-9]+$/, 'Mã rút vốn chỉ được chứa số'),
    inviteCode: z.string().optional(),
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

export const depositRequestSchema = z.object({
    amount: z.number().positive('Số tiền phải lớn hơn 0').min(10, 'Số tiền nạp tối thiểu là 10$'),
    paymentMethod: z.string().optional(),
    paymentProof: z.string().optional(),
    note: z.string().optional(),
})

export const withdrawalRequestSchema = z.object({
    amount: z.number().positive('Số tiền phải lớn hơn 0').min(10, 'Số tiền rút tối thiểu là 10$'),
    withdrawalPin: z.string().min(6, 'Mã rút vốn phải có ít nhất 6 ký tự'),
    bankName: z.string().min(1, 'Tên ngân hàng là bắt buộc'),
    bankAccount: z.string().min(1, 'Số tài khoản là bắt buộc'),
    bankAccountName: z.string().min(1, 'Tên chủ tài khoản là bắt buộc'),
    note: z.string().optional(),
})

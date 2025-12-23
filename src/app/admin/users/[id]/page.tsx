'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UserDetail {
    id: string
    username: string
    email: string | null
    phone: string | null
    role: string
    status: string
    inviteCode: string | null
    referredBy: string | null
    balance: string
    hasPassword: boolean
    hasWithdrawalPin: boolean
    createdAt: string
    updatedAt: string
}

export default function UserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const [user, setUser] = useState<UserDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [resettingPassword, setResettingPassword] = useState(false)
    const [resettingPin, setResettingPin] = useState(false)
    
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        role: 'USER',
        status: 'ACTIVE',
        inviteCode: '',
    })
    
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
    })
    
    const [pinForm, setPinForm] = useState({
        newPin: '',
    })
    
    const [balanceForm, setBalanceForm] = useState({
        amount: '',
        type: 'CREDIT' as 'CREDIT' | 'DEBIT',
        description: '',
    })
    
    const [adjustingBalance, setAdjustingBalance] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchUser()
    }, [userId])

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`)
            const data = await res.json()
            if (data.success) {
                setUser(data.data)
                setFormData({
                    email: data.data.email || '',
                    phone: data.data.phone || '',
                    role: data.data.role,
                    status: data.data.status,
                    inviteCode: data.data.inviteCode || '',
                })
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email || null,
                    phone: formData.phone || null,
                    role: formData.role,
                    status: formData.status,
                    inviteCode: formData.inviteCode || null,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' })
                setEditing(false)
                fetchUser()
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi' })
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setResettingPassword(true)

        try {
            const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordForm),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Đặt lại mật khẩu thành công' })
                setPasswordForm({ newPassword: '' })
                setResettingPassword(false)
                fetchUser()
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi' })
        } finally {
            setResettingPassword(false)
        }
    }

    const handleResetWithdrawalPin = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setResettingPin(true)

        try {
            const res = await fetch(`/api/admin/users/${userId}/reset-withdrawal-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pinForm),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Đặt lại mã rút vốn thành công' })
                setPinForm({ newPin: '' })
                setResettingPin(false)
                fetchUser()
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi' })
        } finally {
            setResettingPin(false)
        }
    }

    const handleAdjustBalance = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setAdjustingBalance(true)

        try {
            const res = await fetch(`/api/admin/users/${userId}/balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.abs(parseFloat(balanceForm.amount)), // Always send positive number
                    type: balanceForm.type, // Send type: 'CREDIT' or 'DEBIT'
                    description: balanceForm.description,
                    note: balanceForm.description, // Also send as note for backward compatibility
                }),
            })

            const data = await res.json()

            if (data.success) {
                // Check if VIP was upgraded
                const vipUpgraded = data.data?.vipUpgraded
                const newVipLevel = data.data?.newVipLevel
                const oldVipLevel = data.data?.oldVipLevel
                
                let successMessage = 'Điều chỉnh số dư thành công'
                if (vipUpgraded && newVipLevel) {
                    successMessage += ` | 🎉 Tự động nâng cấp VIP: ${oldVipLevel || 'Chưa có'} → ${newVipLevel}`
                }
                
                setMessage({ type: 'success', text: successMessage })
                setBalanceForm({ amount: '', type: 'CREDIT', description: '' })
                fetchUser()
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi' })
        } finally {
            setAdjustingBalance(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Đang tải...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Không tìm thấy user</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background - Glassmorphism */}
            <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.05\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
                    }}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/40"></div>
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/8 backdrop-blur-xl rounded-2xl border border-white/18 flex items-center justify-center hover:bg-white/12 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Chi tiết User</h1>
                        <p className="text-sm text-white/60">{user.username}</p>
                    </div>
                </div>

                {message && (
                    <div className={`bg-white/8 backdrop-blur-xl rounded-2xl p-4 border ${
                        message.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'
                    }`}>
                        <p className={`text-sm font-medium ${
                            message.type === 'success' ? 'text-green-300' : 'text-red-300'
                        }`}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* User Info Card */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Thông tin tài khoản</h2>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="px-4 py-2 bg-white/12 hover:bg-white/18 rounded-xl text-white text-sm font-medium transition-colors border border-white/18"
                        >
                            {editing ? 'Hủy' : 'Chỉnh sửa'}
                        </button>
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
                                    <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10 text-white">
                                        {user.username}
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">Username không thể thay đổi</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Vai trò</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="OPERATOR">OPERATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="BANNED">BANNED</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Mã mời</label>
                                    <input
                                        type="text"
                                        value={formData.inviteCode}
                                        onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        placeholder="Mã giới thiệu"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl py-3 font-semibold text-white transition-all shadow-xl"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false)
                                        fetchUser()
                                    }}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors border border-white/10"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Username</p>
                                <p className="font-semibold text-white">{user.username}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Email</p>
                                <p className="font-semibold text-white">{user.email || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Số điện thoại</p>
                                <p className="font-semibold text-white">{user.phone || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Số dư</p>
                                <p className="font-bold text-cyan-400 text-lg">{formatCurrency(user.balance)} $</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Vai trò</p>
                                <div className="inline-block bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
                                    <span className="text-sm font-medium text-blue-300">{user.role}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Trạng thái</p>
                                <div className={`inline-block px-3 py-1 rounded-lg border ${
                                    user.status === 'ACTIVE' 
                                        ? 'bg-green-500/20 border-green-400/30' 
                                        : 'bg-red-500/20 border-red-400/30'
                                }`}>
                                    <span className={`text-sm font-medium ${
                                        user.status === 'ACTIVE' ? 'text-green-300' : 'text-red-300'
                                    }`}>{user.status}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Mã mời</p>
                                <p className="font-semibold text-white">{user.inviteCode || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/60 mb-1">Ngày tạo</p>
                                <p className="font-semibold text-white text-sm">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password & Withdrawal Pin Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reset Password */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Quản lý Mật khẩu</h3>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${user.hasPassword ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                <span className="text-sm text-white/70">
                                    {user.hasPassword ? 'Đã có mật khẩu' : 'Chưa có mật khẩu'}
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={resettingPassword}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl py-3 font-semibold text-white transition-all shadow-xl disabled:opacity-50"
                            >
                                {resettingPassword ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                        </form>
                    </div>

                    {/* Reset Withdrawal Pin */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Quản lý Mã rút vốn</h3>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${user.hasWithdrawalPin ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                <span className="text-sm text-white/70">
                                    {user.hasWithdrawalPin ? 'Đã có mã rút vốn' : 'Chưa có mã rút vốn'}
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleResetWithdrawalPin} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Mã rút vốn mới (6 số)</label>
                                <input
                                    type="text"
                                    value={pinForm.newPin}
                                    onChange={(e) => setPinForm({ newPin: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                    placeholder="123456"
                                    required
                                    minLength={6}
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={resettingPin}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl py-3 font-semibold text-white transition-all shadow-xl disabled:opacity-50"
                            >
                                {resettingPin ? 'Đang xử lý...' : 'Đặt lại mã rút vốn'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Balance Adjustment */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Điều chỉnh số dư</h3>
                    <form onSubmit={handleAdjustBalance} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Loại giao dịch</label>
                            <select
                                value={balanceForm.type}
                                onChange={(e) => setBalanceForm({ ...balanceForm, type: e.target.value as any })}
                                className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                            >
                                <option value="CREDIT">Cộng tiền (CREDIT)</option>
                                <option value="DEBIT">Trừ tiền (DEBIT)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Số tiền ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={balanceForm.amount}
                                onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                                className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Mô tả *</label>
                            <textarea
                                value={balanceForm.description}
                                onChange={(e) => setBalanceForm({ ...balanceForm, description: e.target.value })}
                                className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                rows={3}
                                required
                                minLength={10}
                                placeholder="Nhập mô tả (tối thiểu 10 ký tự)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={adjustingBalance}
                            className={`w-full rounded-xl py-3 font-semibold text-white transition-all shadow-xl disabled:opacity-50 ${
                                balanceForm.type === 'CREDIT'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                            }`}
                        >
                            {adjustingBalance ? 'Đang xử lý...' : `${balanceForm.type === 'CREDIT' ? 'Cộng' : 'Trừ'} tiền`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

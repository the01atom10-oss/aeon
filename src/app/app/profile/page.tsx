'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
    const { data: session } = useSession()
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setLoading(true)

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' })
                setFormData({ currentPassword: '', newPassword: '' })
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi. Vui lòng thử lại.' })
        } finally {
            setLoading(false)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center pb-24">
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white px-4 py-4 pb-24 space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Hồ sơ</h1>
                <p className="text-sm text-gray-400 mt-1">Quản lý thông tin tài khoản</p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-800/60 rounded-2xl p-5 backdrop-blur-sm border border-white/10 shadow-xl">
                <h2 className="font-bold mb-4 text-lg">Thông tin tài khoản</h2>
                <div className="space-y-4">
                    <div className="bg-gray-900/40 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Tên đăng nhập</p>
                        <p className="font-semibold text-lg">{session.user.username}</p>
                    </div>
                    {session.user.email && (
                        <div className="bg-gray-900/40 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Email</p>
                            <p className="font-semibold">{session.user.email}</p>
                        </div>
                    )}
                    <div className="bg-gray-900/40 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Vai trò</p>
                        <div className="inline-block bg-blue-600/30 px-3 py-1 rounded-full text-sm font-medium">
                            {session.user.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-gray-800/60 rounded-2xl p-5 backdrop-blur-sm border border-white/10 shadow-xl">
                <h2 className="font-bold mb-4 text-lg">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    {message && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium shadow-lg ${
                                message.type === 'success'
                                    ? 'bg-green-600/30 text-green-200 border border-green-500/50'
                                    : 'bg-red-600/30 text-red-200 border border-red-500/50'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, currentPassword: e.target.value })
                            }
                            className="w-full bg-gray-700/50 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, newPassword: e.target.value })
                            }
                            className="w-full bg-gray-700/50 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Nhập mật khẩu mới"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl py-3 font-bold shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02]"
                    >
                        {loading ? '⏳ Đang cập nhật...' : '🔒 Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    )
}

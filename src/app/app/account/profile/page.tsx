'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface UserProfile {
    id: string
    username: string
    email: string | null
    phone: string | null
    inviteCode: string | null
    referredBy: string | null
}

export default function ProfilePage() {
    const { data: session, status, update } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user) {
            fetchProfile()
        }
    }, [status, session, router])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
                setFormData({
                    email: data.email || '',
                    phone: data.phone || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setSaving(true)

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email || null,
                    phone: formData.phone || null
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: 'Đã cập nhật thông tin thành công!' })
                await update() // Update session
                fetchProfile()
            } else {
                setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật' })
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' })
            return
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' })
            return
        }

        setSaving(true)

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Đã đổi mật khẩu thành công!' })
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                setMessage({ type: 'error', text: data.error || data.message || 'Có lỗi xảy ra' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đổi mật khẩu' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Không tìm thấy thông tin</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pb-24">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Quản lý thông tin</h1>
                    <p className="text-white/60">Cập nhật thông tin cá nhân và mật khẩu</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${
                        message.type === 'success' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Info Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Thông tin cá nhân</h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2">Username</label>
                            <input
                                type="text"
                                value={profile.username}
                                disabled
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                            />
                            <p className="text-xs text-white/50 mt-1">Username không thể thay đổi</p>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Mã mời</label>
                            <input
                                type="text"
                                value={profile.inviteCode || 'N/A'}
                                disabled
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                            />
                            <p className="text-xs text-white/50 mt-1">Mã mời của bạn</p>
                        </div>

                        {profile.referredBy && (
                            <div>
                                <label className="block text-white/80 mb-2">Được giới thiệu bởi</label>
                                <input
                                    type="text"
                                    value={profile.referredBy}
                                    disabled
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {saving ? 'Đang lưu...' : 'Cập nhật thông tin'}
                        </button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Đổi mật khẩu</h2>
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}


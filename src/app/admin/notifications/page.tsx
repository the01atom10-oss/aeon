'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    username: string
    email: string
    phone: string
}

interface Notification {
    id: string
    user: User | null  // null = broadcast to all users
    userId: string | null
    title: string
    message: string
    type: string
    status: string
    createdAt: string
}

export default function AdminNotificationsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState('')
    const [userSearch, setUserSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        userId: '',
        title: '',
        message: '',
        type: 'INFO'
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/')
        } else {
            fetchNotifications()
        }
    }, [status, session, router])

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/admin/notifications?search=${search}`)
            const data = await res.json()
            setNotifications(data.notifications || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = async (searchTerm: string) => {
        if (!searchTerm || searchTerm.length < 2) {
            setUsers([])
            return
        }
        try {
            const res = await fetch(`/api/admin/notifications/users?search=${searchTerm}`)
            const data = await res.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Error searching users:', error)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (res.ok) {
                alert('Thông báo đã được tạo!')
                setShowForm(false)
                setFormData({ userId: '', title: '', message: '', type: 'INFO' })
                fetchNotifications()
            } else {
                const error = await res.json()
                alert(`Lỗi: ${error.error}`)
            }
        } catch (error) {
            console.error('Error creating notification:', error)
            alert('Có lỗi xảy ra!')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return
        
        try {
            const res = await fetch(`/api/admin/notifications/${id}`, {
                method: 'DELETE'
            })
            
            if (res.ok) {
                alert('Đã xóa thông báo!')
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Quản lý Thông báo</h1>
                        <p className="text-white/60">Gửi và quản lý thông báo cho người dùng</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        {showForm ? 'Đóng' : '+ Tạo thông báo'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Tạo thông báo mới</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-white/80 mb-2">
                                    Tìm người dùng <span className="text-white/40 text-xs">(Để trống để gửi cho tất cả)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên, email hoặc SĐT... (để trống = gửi tất cả)"
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value)
                                        if (e.target.value.trim() === '') {
                                            setFormData({ ...formData, userId: '' })
                                            setUsers([])
                                        } else {
                                            searchUsers(e.target.value)
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                />
                                {userSearch.trim() === '' && (
                                    <p className="mt-2 text-sm text-yellow-400">
                                        ⚠️ Để trống sẽ gửi thông báo cho TẤT CẢ người dùng (broadcast)
                                    </p>
                                )}
                                {users.length > 0 && (
                                    <div className="mt-2 bg-white/5 border border-white/20 rounded-lg max-h-48 overflow-y-auto">
                                        {users.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, userId: user.id })
                                                    setUserSearch(`${user.username} (${user.email})`)
                                                    setUsers([])
                                                }}
                                                className="w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="font-semibold">{user.username}</div>
                                                <div className="text-sm text-white/60">{user.email}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">Tiêu đề</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">Nội dung</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">Loại</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                >
                                    <option value="INFO">Thông tin</option>
                                    <option value="SUCCESS">Thành công</option>
                                    <option value="WARNING">Cảnh báo</option>
                                    <option value="ERROR">Lỗi</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
                            >
                                {formData.userId ? 'Gửi thông báo' : 'Gửi cho tất cả người dùng'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thông báo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchNotifications()}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white"
                    />
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            notif.type === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                                            notif.type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                                            notif.type === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {notif.type}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            notif.status === 'READ' ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-purple-500/20 text-purple-400'
                                        }`}>
                                            {notif.status === 'READ' ? 'Đã đọc' : 'Chưa đọc'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{notif.title}</h3>
                                    <p className="text-white/80 mb-3">{notif.message}</p>
                                    <div className="flex gap-4 text-sm text-white/60 flex-wrap">
                                        {notif.user ? (
                                            <>
                                                <span>Người dùng: {notif.user.username}</span>
                                                <span>Email: {notif.user.email}</span>
                                            </>
                                        ) : (
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                                📢 Gửi cho tất cả người dùng
                                            </span>
                                        )}
                                        <span>{new Date(notif.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(notif.id)}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <div className="text-center text-white/60 py-12">
                        Chưa có thông báo nào
                    </div>
                )}
            </div>
        </div>
    )
}


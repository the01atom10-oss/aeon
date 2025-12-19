'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface User {
    id: string
    username: string
    email: string | null
    phone: string | null
    role: string
    status: string
    balance: string
    createdAt: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createForm, setCreateForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        withdrawalPin: '',
        role: 'USER',
        inviteCode: '',
    })
    const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [searchQuery])

    const fetchUsers = async () => {
        try {
            const url = searchQuery
                ? `/api/admin/users?query=${encodeURIComponent(searchQuery)}`
                : '/api/admin/users'
            const res = await fetch(url)
            const data = await res.json()

            if (data.success) {
                setUsers(data.data.users)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(query)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateMessage(null)
        setCreating(true)

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            })

            const data = await res.json()

            if (data.success) {
                const inviteCode = data.data?.inviteCode || 'N/A'
                setCreateMessage({ 
                    type: 'success', 
                    text: `Tạo user thành công! Mã mời: ${inviteCode}` 
                })
                setCreateForm({
                    username: '',
                    email: '',
                    phone: '',
                    password: '',
                    withdrawalPin: '',
                    role: 'USER',
                    inviteCode: '',
                })
                setShowCreateForm(false)
                fetchUsers()
            } else {
                setCreateMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setCreateMessage({ type: 'error', text: 'Đã xảy ra lỗi' })
        } finally {
            setCreating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" />
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

            <div className="relative z-10 px-4 py-6 max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Quản lý Users</h1>
                        <p className="text-sm text-white/60 mt-1">Danh sách và tìm kiếm người dùng</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all shadow-xl flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {showCreateForm ? 'Đóng' : 'Tạo User mới'}
                    </button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4">Tạo User mới</h2>
                        {createMessage && (
                            <div className={`mb-4 p-3 rounded-xl text-sm ${
                                createMessage.type === 'success' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                                {createMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Username *</label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={createForm.phone}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Vai trò</label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="OPERATOR">OPERATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Mật khẩu *</label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Mã rút vốn (6 số) *</label>
                                    <input
                                        type="text"
                                        value={createForm.withdrawalPin}
                                        onChange={(e) => setCreateForm({ ...createForm, withdrawalPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        required
                                        minLength={6}
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Mã mời <span className="text-white/40 text-xs">(Để trống để tự động tạo)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.inviteCode}
                                        onChange={(e) => setCreateForm({ ...createForm, inviteCode: e.target.value.toUpperCase() })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                                        placeholder="Để trống để hệ thống tự động tạo mã mời"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl py-3 font-semibold text-white transition-all shadow-xl disabled:opacity-50"
                                >
                                    {creating ? 'Đang tạo...' : 'Tạo User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false)
                                        setCreateMessage(null)
                                    }}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors border border-white/10"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search and Users List */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                    <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Tìm theo username, email, phone..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/30"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all shadow-xl"
                        >
                            Tìm kiếm
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Username</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Email/Phone</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Balance</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Joined</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-medium text-white">{user.username}</td>
                                        <td className="py-3 px-4 text-sm text-white/70">
                                            {user.email || user.phone || '-'}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-cyan-400">
                                            {formatCurrency(user.balance)} $
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    user.status === 'ACTIVE'
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-white/60">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                                            >
                                                Chi tiết →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <p className="text-center text-white/60 py-8">
                                Không tìm thấy user nào
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR') {
        redirect('/app')
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background - Glassmorphism style */}
            <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.05\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
                    }}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/40"></div>
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                            <p className="text-white/60">Quản lý hệ thống 9Carat</p>
                        </div>
                        <div className="bg-white/8 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/18">
                            <p className="text-sm text-white/60">Xin chào</p>
                            <p className="font-semibold text-white">{session.user.username}</p>
                        </div>
                    </div>
                </div>

                {/* Admin Cards - Glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/admin/users" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl border border-blue-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Quản lý Users</h3>
                            <p className="text-sm text-white/60">
                                Xem và quản lý người dùng, chỉnh sửa số dư
                            </p>
                        </div>
                    </Link>


                    <Link href="/admin/audit-logs" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl border border-purple-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Audit Logs</h3>
                            <p className="text-sm text-white/60">
                                Xem lịch sử thao tác admin
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/vip-levels" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl border border-yellow-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">VIP Levels</h3>
                            <p className="text-sm text-white/60">
                                Điều chỉnh giới hạn Credit cho từng VIP level
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/chat" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Quản lý Chat</h3>
                            <p className="text-sm text-white/60">
                                Xem và trả lời tin nhắn từ người dùng
                            </p>
                        </div>
                    </Link>

                    {/* <Link href="/admin/products" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-pink-500/20 rounded-2xl border border-pink-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Quản lý Sản phẩm</h3>
                            <p className="text-sm text-white/60">
                                Thêm và quản lý sản phẩm cho người dùng
                            </p>
                        </div>
                    </Link> */}

                    <Link href="/admin/task-products" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl border border-rose-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Sản phẩm Giật đơn</h3>
                            <p className="text-sm text-white/60">
                                Quản lý sản phẩm cho nhiệm vụ
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/task-runs" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Duyệt Nhiệm vụ</h3>
                            <p className="text-sm text-white/60">
                                Xem và duyệt đơn giật hàng
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/quick-balance" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Quick Balance</h3>
                            <p className="text-sm text-white/60">
                                Thêm/trừ balance nhanh cho user
                            </p>
                        </div>
                    </Link>

                    {/* <Link href="/admin/sync-balance" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl border border-orange-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Đồng bộ Balance</h3>
                            <p className="text-sm text-white/60">
                                Sync Wallet → User balance
                            </p>
                        </div>
                    </Link> */}

                    <Link href="/admin/notifications" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-sky-500/20 rounded-2xl border border-sky-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Thông báo</h3>
                            <p className="text-sm text-white/60">
                                Gửi thông báo cho người dùng
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/wheel-prizes" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl border border-orange-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Vòng quay</h3>
                            <p className="text-sm text-white/60">
                                Quản lý giải thưởng vòng quay
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/shop-groups" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl border border-teal-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Gian hàng</h3>
                            <p className="text-sm text-white/60">
                                Quản lý nhóm gian hàng
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/settings" className="group">
                        <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-xl text-white mb-2">Cấu hình</h3>
                            <p className="text-sm text-white/60">
                                Email, SĐT CSKH, STK nhận tiền
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Quick Link to App */}
                <div className="mt-8">
                    <Link href="/app" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Quay lại ứng dụng</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

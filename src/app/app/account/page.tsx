import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WalletService } from '@/services/wallet.service'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import ImageSlider from '@/components/ui/ImageSlider'
import NotificationList from '@/components/notifications/NotificationList'

export default async function AccountPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const balance = await WalletService.getBalance(session.user.id)
    const vipLevel = await WalletService.getUserVipLevel(session.user.id)

    // Slider images - Tất cả ảnh từ thư mục public/img
    const sliderImages = [
        '/img/6203955275983686762.jpg',
        '/img/6203998122577431836.jpg',
        '/img/6203998122577431837.jpg',
        '/img/6203998122577431838.jpg',
        '/img/6203998122577431839.jpg',
        '/img/6203998122577431840.jpg',
        '/img/6203998122577431841.jpg',
        '/img/6203998122577431842.jpg',
        '/img/6203998122577431843.jpg',
        '/img/6203998122577431844.jpg',
        '/img/6203998122577431846.jpg',
        '/img/6203998122577431848.jpg',
        '/img/6203998122577431850.jpg',
        '/img/6203998122577431851.jpg',
        '/img/6203998122577431852.jpg',
        '/img/6203998122577431853.jpg',
        '/img/6203998122577431855.jpg',
        '/img/6203998122577431856.jpg',
    ]

    return (
        <div className="min-h-screen text-white px-4 py-4 space-y-4 pb-24">
            {/* Header with greeting and notifications */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/18 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-white/60">Hello</p>
                        <h2 className="text-lg font-semibold text-white">{session.user.username}</h2>
                    </div>
                </div>
                <NotificationList />
            </div>

            {/* Balance Card - Glassmorphism */}
            <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-2xl">
                <p className="text-sm text-white/70 mb-2">Số dư khả dụng</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg text-white/60 font-medium">$</span>
                    <p className="text-5xl font-bold text-white tracking-tight">{formatCurrency(balance.toString())}</p>
                </div>
            </div>

            {/* Quick Actions - 2 buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/app/account/deposit" className="group">
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-white/18 shadow-xl hover:bg-white/12 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">Nạp nhanh</p>
                                <p className="text-white/60 text-xs">Chuyển khoản ngay</p>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link href="/app/account/withdraw" className="group">
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-white/18 shadow-xl hover:bg-white/12 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-400/30 flex items-center justify-center">
                                <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">Rút nhanh</p>
                                <p className="text-white/60 text-xs">Về tài khoản</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Lucky Wheel Featured Button */}
            <Link href="/app/lucky-wheel" className="block group">
                <div className="relative overflow-hidden rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl shadow-2xl hover:scale-[1.02] active:scale-100 transition-all">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 blur-xl"></div>
                    
                    <div className="relative p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl animate-spin-slow group-hover:scale-110 transition-transform">🎰</div>
                                <div>
                                    <p className="text-xl font-bold text-white drop-shadow-lg">Vòng Quay May Mắn</p>
                                    <p className="text-sm text-yellow-200/90">
                                        Chỉ <span className="font-bold text-green-300">$20</span>/lượt - Trúng đến <span className="font-bold text-red-300">$100</span>!
                                    </p>
                                </div>
                            </div>
                            <svg className="w-6 h-6 text-yellow-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Image Slider - 9Carat Gallery */}
            <div className="relative rounded-3xl overflow-hidden border border-white/18 shadow-2xl h-48">
                <ImageSlider images={sliderImages} interval={5000} />
                
                {/* Overlay with branding */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-20">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-xl font-bold tracking-wider drop-shadow-lg">9CARAT</p>
                        <p className="text-xs text-white/90 drop-shadow-lg mt-1">Nền tảng phần thưởng</p>
                    </div>
                </div>
            </div>

            {/* Overview Section - Glassmorphism */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Tổng quan Dubai Mall</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/app/account/company" className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 flex flex-col items-center gap-3 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                        <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-sm text-center font-medium text-white">Hồ sơ công ty</span>
                    </Link>
                    <Link href="/app/account/rules" className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 flex flex-col items-center gap-3 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm text-center font-medium text-white">Quy tắc nền tảng</span>
                    </Link>
                    <Link href="/app/account/cooperation" className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 flex flex-col items-center gap-3 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl border border-purple-400/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-sm text-center font-medium text-white">Hợp tác phát triển</span>
                    </Link>
                    <Link href="/app/account/notifications" className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 flex flex-col items-center gap-3 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                        <div className="w-14 h-14 bg-orange-500/20 rounded-2xl border border-orange-400/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm text-center font-medium text-white">Thư thông báo</span>
                    </Link>
                    <Link href="/app/account/profile" className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 flex flex-col items-center gap-3 border border-white/18 hover:bg-white/12 transition-all hover:scale-[1.02] shadow-xl">
                        <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl border border-cyan-400/30 flex items-center justify-center">
                            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="text-sm text-center font-medium text-white">Quản lý thông tin</span>
                    </Link>
                </div>
            </div>

            {/* Sảnh nhiệm vụ - Mission Hall - Glassmorphism */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Sảnh nhiệm vụ</h3>
                <div className="grid grid-cols-2 gap-3">
                    {/* Thành Viên Vàng */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-yellow-400/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
                        <div className="relative">
                            <div className="bg-yellow-500/20 rounded-2xl px-3 py-1.5 inline-block mb-3 border border-yellow-400/30">
                                <span className="text-xs font-bold text-yellow-300">Thành Viên Vàng</span>
                            </div>
                            <div className="text-4xl font-bold mb-1 text-white">0.5%</div>
                            <div className="text-xs text-white/60 mb-4">Hoa hồng</div>
                            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/70">
                                <div className="flex justify-between">
                                    <span>Túi xách</span>
                                    <span>Quần áo nữ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giày</span>
                                    <span>Đẹp</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thành Viên Bạc */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-gray-400/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-400/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
                        <div className="relative">
                            <div className="bg-gray-500/20 rounded-2xl px-3 py-1.5 inline-block mb-3 border border-gray-400/30">
                                <span className="text-xs font-bold text-gray-300">Thành Viên Bạc</span>
                            </div>
                            <div className="text-4xl font-bold mb-1 text-white">0.6%</div>
                            <div className="text-xs text-white/60 mb-4">Hoa hồng</div>
                            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/70">
                                <div className="flex justify-between">
                                    <span>Điện thoại</span>
                                    <span>Từ lành</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Máy tính</span>
                                    <span>Chuột</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thành Viên Kim Cương */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-cyan-400/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
                        <div className="relative">
                            <div className="bg-cyan-500/20 rounded-2xl px-3 py-1.5 inline-block mb-3 border border-cyan-400/30">
                                <span className="text-xs font-bold text-cyan-300">Thành Viên Kim Cương</span>
                            </div>
                            <div className="text-4xl font-bold mb-1 text-white">0.7%</div>
                            <div className="text-xs text-white/60 mb-4">Hoa hồng</div>
                            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/70">
                                <div className="flex justify-between">
                                    <span>Máy ảnh</span>
                                    <span>Âm thanh</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Xe máy</span>
                                    <span>Mũ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thành Viên Bạch Kim */}
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-purple-400/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
                        <div className="relative">
                            <div className="bg-purple-500/20 rounded-2xl px-3 py-1.5 inline-block mb-3 border border-purple-400/30">
                                <span className="text-xs font-bold text-purple-300">Thành Viên Bạch Kim</span>
                            </div>
                            <div className="text-4xl font-bold mb-1 text-white">0.8%</div>
                            <div className="text-xs text-white/60 mb-4">Hoa hồng</div>
                            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/70">
                                <div className="flex justify-between">
                                    <span>Đồng hồ</span>
                                    <span>Trang sức</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Nội thất</span>
                                    <span>Điện tử</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import ImageSlider from '@/components/ui/ImageSlider'

export default async function AppDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    // Get user balance
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true }
    })
    const balance = user?.balance ? Number(user.balance) : 0

    // Get VIP level based on balance
    const vipLevel = await prisma.vipLevel.findFirst({
        where: {
            minBalance: { lte: balance },
            isActive: true
        },
        orderBy: { minBalance: 'desc' }
    })

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
        <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-6 px-2 sm:px-0">
            {/* Image Slider */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
                <ImageSlider images={sliderImages} interval={5000} />
                
                {/* Overlay Welcome */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                            Xin chào, {session.user.username}! 👋
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-white/90 drop-shadow-lg">
                            Chào mừng bạn đến với 9Carat Reward Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Lucky Wheel Featured Button */}
            <Link href="/app/lucky-wheel">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-0.5 sm:p-1 hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform shadow-lg sm:shadow-2xl cursor-pointer group active:scale-100">
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                            <div className="text-3xl sm:text-5xl md:text-6xl animate-spin-slow group-hover:animate-bounce flex-shrink-0">🎰</div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent truncate">
                                    Vòng Quay May Mắn
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">
                                    Chỉ <span className="font-bold text-green-600">$20</span>/lượt - Trúng đến <span className="font-bold text-red-600">$100</span>!
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 text-orange-600 flex-shrink-0 ml-4">
                            <span className="font-bold whitespace-nowrap">Quay ngay</span>
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                        <div className="flex md:hidden items-center flex-shrink-0 ml-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Balance Card */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Số dư tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-3 sm:mb-4">
                        {formatCurrency(balance.toString())}
                    </div>

                    {vipLevel && (
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Cấp VIP hiện tại</p>
                                    <p className="text-lg sm:text-xl font-bold text-yellow-700">
                                        {vipLevel.name}
                                    </p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-xs sm:text-sm text-gray-600">Tỷ lệ thưởng</p>
                                    <p className="text-lg sm:text-xl font-bold text-yellow-700">
                                        {formatPercentage(Number(vipLevel.commissionRate).toString())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <Link href="/app/tasks">
                    <Card className="hover:shadow-lg transition-all cursor-pointer active:scale-95 h-full">
                        <CardContent className="text-center py-4 sm:py-5 md:py-6">
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎯</div>
                            <h3 className="font-semibold text-sm sm:text-base">Nhiệm vụ</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                                Hoàn thành và kiếm thưởng
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/app/shop">
                    <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 active:scale-95 h-full">
                        <CardContent className="text-center py-4 sm:py-5 md:py-6">
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🛍️</div>
                            <h3 className="font-semibold text-purple-700 text-sm sm:text-base">Cửa hàng</h3>
                            <p className="text-xs sm:text-sm text-purple-600 mt-0.5 sm:mt-1 hidden sm:block">
                                Mua sản phẩm với Credits
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/app/lucky-wheel">
                    <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 active:scale-95 h-full">
                        <CardContent className="text-center py-4 sm:py-5 md:py-6">
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎰</div>
                            <h3 className="font-semibold text-orange-700 text-sm sm:text-base">Vòng quay</h3>
                            <p className="text-xs sm:text-sm text-orange-600 mt-0.5 sm:mt-1 hidden sm:block">
                                Thử vận may nhận thưởng
                            </p>
                        </CardContent>
                    </Card>
                </Link>


                <Link href="/app/chat">
                    <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 active:scale-95 h-full">
                        <CardContent className="text-center py-4 sm:py-5 md:py-6">
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">💬</div>
                            <h3 className="font-semibold text-blue-700 text-sm sm:text-base">Hỗ trợ</h3>
                            <p className="text-xs sm:text-sm text-blue-600 mt-0.5 sm:mt-1 hidden sm:block">
                                Chat với admin 24/7
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/app/profile">
                    <Card className="hover:shadow-lg transition-all cursor-pointer active:scale-95 h-full">
                        <CardContent className="text-center py-4 sm:py-5 md:py-6">
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">👤</div>
                            <h3 className="font-semibold text-sm sm:text-base">Hồ sơ</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                                Quản lý tài khoản
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Info Banner */}
            <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardContent className="py-3 sm:py-4">
                    <p className="text-xs sm:text-sm text-blue-800">
                        💡 <strong>Mẹo:</strong> Hoàn thành nhiều nhiệm vụ để tăng số dư và
                        nâng cấp VIP, nhận tỷ lệ thưởng cao hơn!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

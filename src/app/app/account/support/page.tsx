import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to always fetch fresh settings
export const dynamic = 'force-dynamic'

async function getSettings() {
    try {
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['support_email', 'support_phone']
                }
            }
        })

        // Convert to key-value object
        const settingsObj: Record<string, string> = {}
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value || ''
        })

        return {
            support_email: settingsObj.support_email || 'support@9carat.com',
            support_phone: settingsObj.support_phone || '1900-xxxx'
        }
    } catch (error) {
        console.error('Error fetching settings:', error)
        // Return defaults if fetch fails
        return {
            support_email: 'support@9carat.com',
            support_phone: '1900-xxxx'
        }
    }
}

export default async function SupportPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const settings = await getSettings()

    return (
        <div className="min-h-screen text-white px-4 py-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h1 className="text-3xl font-bold mb-2">💬 Chăm sóc khách hàng</h1>
                <p className="text-gray-300">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
            </div>

            {/* Live Chat Section */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
                <div className="text-7xl mb-4 animate-bounce">💬</div>
                <h2 className="text-2xl font-bold mb-3">Chat trực tuyến</h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Nhấn vào icon chat ở <strong className="text-green-400">góc phải dưới màn hình</strong> để trò chuyện ngay với đội ngũ hỗ trợ!
                </p>
                
                {/* Animated Arrow Pointer */}
                <div className="flex justify-end">
                    <div className="relative">
                        <div className="absolute -right-4 top-0 text-6xl animate-bounce">
                            👇
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl mb-3">📱</div>
                    <h3 className="text-xl font-bold mb-2">Hotline</h3>
                    <p className="text-gray-400 text-sm mb-3">
                        Gọi cho chúng tôi bất cứ lúc nào
                    </p>
                    <a href={`tel:${settings.support_phone?.replace(/\s/g, '') || '1900xxxx'}`} className="text-blue-400 font-semibold text-lg">
                        {settings.support_phone || '1900-xxxx'}
                    </a>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl mb-3">📧</div>
                    <h3 className="text-xl font-bold mb-2">Email</h3>
                    <p className="text-gray-400 text-sm mb-3">
                        Gửi email, chúng tôi sẽ trả lời trong 24h
                    </p>
                    <a href={`mailto:${settings.support_email || 'support@9carat.com'}`} className="text-blue-400 font-semibold">
                        {settings.support_email || 'support@9carat.com'}
                    </a>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/app/chat">
                    <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 hover:bg-blue-500/30 transition-all text-center">
                        <div className="text-3xl mb-2">💭</div>
                        <p className="font-semibold">Lịch sử Chat</p>
                    </div>
                </Link>

                <Link href="/app/lucky-wheel">
                    <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 hover:bg-yellow-500/30 transition-all text-center">
                        <div className="text-3xl mb-2">🎰</div>
                        <p className="font-semibold">Vòng quay</p>
                    </div>
                </Link>

                
                <Link href="/app/account/mission">
                    <div className="bg-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-pink-400/30 hover:bg-pink-500/30 transition-all text-center">
                        <div className="text-3xl mb-2">🏪</div>
                        <p className="font-semibold">Nhiệm vụ</p>
                    </div>
                </Link>
            </div>

            {/* FAQs */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">❓ Câu hỏi thường gặp</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-green-400 mb-1">Vòng quay may mắn hoạt động thế nào?</h4>
                        <p className="text-sm text-gray-400">
                           Mỗi lần giật đơn thành công được thưởng 1 vòng quay
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-400 mb-1">Làm thế nào để tăng cấp VIP?</h4>
                        <p className="text-sm text-gray-400">
                            Tích lũy số dư trong tài khoản bằng cách hoàn thành nhiệm vụ. Cấp VIP tự động nâng cấp khi đủ điều kiện.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-400 mb-1">Làm thế nào để nhận nhiệm vụ?</h4>
                        <p className="text-sm text-gray-400">
                            Vào mục "Nhiệm vụ" hoặc "Gian hàng", chọn gian hàng phù hợp với VIP level của bạn và bắt đầu giật đơn.
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Reminder */}
            <div className="fixed bottom-28 right-6 z-40 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce pointer-events-none">
                <p className="text-sm font-semibold">👇 Chat với chúng tôi!</p>
            </div>
        </div>
    )
}

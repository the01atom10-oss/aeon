import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default async function MyAccountPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true }
    })

    const balance = user?.balance ? Number(user.balance) : 0

    const vipLevel = await prisma.vipLevel.findFirst({
        where: {
            minBalance: { lte: balance },
            isActive: true
        },
        orderBy: { minBalance: 'desc' }
    })

    return (
        <div className="min-h-screen text-white px-4 py-6 space-y-6">
            {/* User Profile */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                </div>
                <div>
                    <p className="text-xl font-semibold">{session.user.username}</p>
                </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Số dư</p>
                    <p className="text-2xl font-bold">{formatCurrency(balance.toString())} $</p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Cấp thành viên</p>
                    <p className="text-2xl font-bold">{vipLevel?.name || 'Bạc'}</p>
                </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
                <Link href="/app/account/profile" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Quản lý thông tin</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                <Link href="/app/account/deposit" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Nạp tiền</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                <Link href="/app/account/withdraw" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Rút tiền</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                <Link href="/app/account/withdraw-history" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Lịch sử rút tiền</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                <Link href="/app/account/deposit-history" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Lịch sử nạp tiền</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                <Link href="/app/account/order-history" className="block bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-gray-700/60 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Lịch sử đơn hàng</span>
                        <span className="text-gray-400">›</span>
                    </div>
                </Link>
                
            </div>

            {/* Logout Button */}
            <LogoutButton />
        </div>
    )
}


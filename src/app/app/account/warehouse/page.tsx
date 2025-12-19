import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function WarehousePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen text-white px-4 py-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold">Kho</h1>
                <p className="text-sm text-gray-400 mt-1">Quản lý sản phẩm và đơn hàng</p>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-gray-400">Kho của bạn đang trống</p>
            </div>
        </div>
    )
}


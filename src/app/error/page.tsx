'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function ErrorPage() {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-white mb-4">Phiên đăng nhập hết hạn</h1>
                <p className="text-gray-300 mb-6">
                    Vui lòng đăng xuất và đăng nhập lại để tiếp tục sử dụng hệ thống.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl"
                    >
                        Đăng xuất ngay
                    </button>
                    <Link
                        href="/login"
                        className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-3 rounded-xl transition-all"
                    >
                        Quay lại trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}


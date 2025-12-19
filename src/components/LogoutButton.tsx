'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full bg-red-600 hover:bg-red-700 rounded-lg py-3 font-semibold transition-colors"
        >
            Đăng xuất
        </button>
    )
}


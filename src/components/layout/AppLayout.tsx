'use client'

import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import LiveChatWidget from '@/components/chat/LiveChatWidget'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/admin')

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <h1 className="text-xl font-bold text-primary-600">Admin Panel</h1>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
                <LiveChatWidget />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Dark background with photo overlay - Glassmorphism style */}
            <div className="fixed inset-0">
                {/* Background image layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.05\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
                    }}></div>
                </div>
                {/* Overlay layer for glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/40"></div>
                {/* Additional blur layer */}
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            </div>

            {/* Main content */}
            <main className="relative z-10 pb-20">
                {children}
            </main>

            {/* Bottom Navigation - Glassmorphism with gradient */}
            <nav className="fixed bottom-0 left-0 right-0 z-50">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-fuchsia-600 to-indigo-600"></div>
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/8 backdrop-blur-xl border-t border-white/18"></div>
                
                <div className="relative flex justify-around items-center h-20 px-2">
                    <BottomNavLink href="/app/account" pathname={pathname} icon="home" label="Trang chủ" />
                    <BottomNavLink href="/app/account/mission/history" pathname={pathname} icon="history" label="Lịch Sử" />
                    
                    {/* Center FAB Button - Floating Action Button */}
                    <div className="flex flex-col items-center -mt-10">
                        <Link
                            href="/app/account/mission"
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl relative group",
                                pathname === '/app/account/mission' || pathname.startsWith('/app/account/mission/')
                                    ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 scale-110 ring-4 ring-white/30"
                                    : "bg-gradient-to-br from-rose-500/90 to-fuchsia-600/90 hover:scale-105 hover:ring-2 hover:ring-white/20"
                            )}
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                            {/* Icon */}
                            <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </Link>
                        <span className="text-xs text-white font-bold mt-2 drop-shadow-lg">9Carat</span>
                    </div>
                    
                    <BottomNavLink href="/app/account/support" pathname={pathname} icon="support" label="CSKH" />
                    <BottomNavLink href="/app/account/my" pathname={pathname} icon="user" label="Tôi" />
                </div>
            </nav>

            {/* Live Chat Widget */}
            <LiveChatWidget />
        </div>
    )
}

function BottomNavLink({ href, pathname, icon, label }: { href: string; pathname: string; icon: string; label: string }) {
    const isActive = pathname === href || (href !== '/app/account' && pathname.startsWith(href))
    
    const iconMap: Record<string, JSX.Element> = {
        home: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        history: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        support: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        user: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    }
    
    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all relative group',
                isActive ? '' : 'opacity-70 hover:opacity-100'
            )}
        >
            {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full shadow-lg"></div>
            )}
            <div className={cn(
                "mb-1 transition-all text-white",
                isActive && "scale-110"
            )}>
                {iconMap[icon] || iconMap.home}
            </div>
            {label && (
                <span className={cn(
                    "text-xs font-medium transition-all text-white",
                    isActive ? "font-bold" : ""
                )}>{label}</span>
            )}
        </Link>
    )
}

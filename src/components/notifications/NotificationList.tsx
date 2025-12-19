'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
    id: string
    title: string
    message: string
    status: string
    createdAt: string
}

export default function NotificationList() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showList, setShowList] = useState(false)

    useEffect(() => {
        if (session?.user) {
            fetchNotifications()
            // Refresh every 30 seconds
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [session])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST'
            })
            if (res.ok) {
                setNotifications(prev => 
                    prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => n.status === 'UNREAD').map(n => n.id)
            await Promise.all(unreadIds.map(id => markAsRead(id)))
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    return (
        <div className="relative">
            {/* Notification Icon */}
            <button
                onClick={() => setShowList(!showList)}
                className="relative w-10 h-10 bg-white/8 backdrop-blur-xl rounded-2xl border border-white/18 flex items-center justify-center hover:bg-white/12 transition-colors"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-black/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {/* Notification List Dropdown */}
            {showList && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowList(false)}
                    />
                    <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-white/60 hover:text-white transition-colors"
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="p-4 text-center text-white/60">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-4 text-center text-white/60">
                                    Chưa có thông báo nào
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${
                                            notification.status === 'UNREAD' ? 'bg-white/5' : ''
                                        }`}
                                        onClick={() => {
                                            if (notification.status === 'UNREAD') {
                                                markAsRead(notification.id)
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            {notification.status === 'UNREAD' && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white mb-1">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-white/70 mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-white/50">
                                                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}


'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ChatMessage {
    id: string
    userId: string | null
    message: string
    isAdmin: boolean
    createdAt: string
    user?: {
        username: string
        email: string | null
    }
}

export default function AdminChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [broadcastMessage, setBroadcastMessage] = useState('')

    useEffect(() => {
        loadMessages()
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [])

    const loadMessages = async () => {
        try {
            const response = await fetch('/api/admin/chat')
            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages)
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReply = async (userId: string) => {
        if (!replyMessage.trim()) return

        try {
            const response = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: replyMessage,
                    userId
                })
            })

            if (response.ok) {
                setReplyMessage('')
                setReplyTo(null)
                await loadMessages()
            }
        } catch (error) {
            console.error('Failed to send reply:', error)
        }
    }

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return

        try {
            const response = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: broadcastMessage,
                    userId: null
                })
            })

            if (response.ok) {
                setBroadcastMessage('')
                await loadMessages()
            }
        } catch (error) {
            console.error('Failed to broadcast:', error)
        }
    }

    // Group messages by user
    const groupedMessages = messages.reduce((acc, msg) => {
        const key = msg.userId || 'broadcast'
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(msg)
        return acc
    }, {} as Record<string, ChatMessage[]>)

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải tin nhắn...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Chat</h1>
                <p className="text-gray-600 mt-1">Xem và trả lời tin nhắn từ người dùng</p>
            </div>

            {/* Broadcast Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">📢 Gửi tin nhắn broadcast</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            placeholder="Nhập tin nhắn broadcast cho tất cả người dùng..."
                            className="flex-1"
                        />
                        <Button
                            onClick={handleBroadcast}
                            disabled={!broadcastMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Gửi
                        </Button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                        Tin nhắn broadcast sẽ được gửi đến tất cả người dùng
                    </p>
                </CardContent>
            </Card>

            {/* Chat Conversations */}
            <div className="grid grid-cols-1 gap-4">
                {Object.entries(groupedMessages).map(([userId, msgs]) => {
                    const userMessages = msgs.filter(m => !m.isAdmin)
                    const adminMessages = msgs.filter(m => m.isAdmin)
                    const lastUserMessage = userMessages[userMessages.length - 1]
                    
                    if (userId === 'broadcast') {
                        return (
                            <Card key={userId} className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">📢 Tin nhắn broadcast</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {msgs.map(msg => (
                                            <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
                                                <p className="text-sm">{msg.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }

                    return (
                        <Card key={userId}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {lastUserMessage?.user?.username || 'Unknown User'}
                                        </CardTitle>
                                        <p className="text-xs text-gray-500">
                                            {lastUserMessage?.user?.email}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {userMessages.length} tin nhắn
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                    {msgs.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                                    msg.isAdmin
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${
                                                    msg.isAdmin ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Section */}
                                {replyTo === userId ? (
                                    <div className="border-t pt-4">
                                        <div className="flex space-x-2">
                                            <Input
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Nhập câu trả lời..."
                                                className="flex-1"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleReply(userId)
                                                    }
                                                }}
                                            />
                                            <Button
                                                onClick={() => handleReply(userId)}
                                                disabled={!replyMessage.trim()}
                                            >
                                                Gửi
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setReplyTo(null)
                                                    setReplyMessage('')
                                                }}
                                                variant="outline"
                                            >
                                                Hủy
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t pt-4">
                                        <Button
                                            onClick={() => setReplyTo(userId)}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            💬 Trả lời
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}

                {Object.keys(groupedMessages).length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            <div className="text-5xl mb-4">💬</div>
                            <p>Chưa có tin nhắn nào</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}



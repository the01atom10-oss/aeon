'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
    id: string
    sender: 'user' | 'admin'
    message: string
    timestamp: Date
    senderName?: string
}

export default function LiveChatWidget() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0)
            // Load messages from API
            loadMessages()
        }
    }, [isOpen])

    // Listen for open chat event
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true)
        }

        window.addEventListener('openChat', handleOpenChat)
        return () => window.removeEventListener('openChat', handleOpenChat)
    }, [])

    // Auto-refresh messages every 1 second when chat is open for real-time experience
    useEffect(() => {
        if (!isOpen) return

        const interval = setInterval(() => {
            loadMessages()
        }, 1000)

        return () => clearInterval(interval)
    }, [isOpen])

    const loadMessages = async () => {
        try {
            const response = await fetch('/api/chat/messages')
            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages || [])
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputMessage.trim() || !session?.user) return

        const tempMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            message: inputMessage,
            timestamp: new Date(),
            senderName: session.user.username
        }

        setMessages(prev => [...prev, tempMessage])
        setInputMessage('')

        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputMessage })
            })

            if (response.ok) {
                // Refresh messages to get the latest
                await loadMessages()
            }
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    if (!session?.user) return null

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold animate-pulse">
                                {unreadCount}
                            </div>
                        )}
                    </>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-[140px] right-2 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 h-[calc(100vh-180px)] sm:h-[500px] max-h-[600px] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 text-white flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="relative">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg">Hỗ trợ AEON</h3>
                                    <p className="text-xs text-blue-100">Trực tuyến</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="font-semibold mb-2">Chào mừng đến với hỗ trợ AEON!</p>
                                <p className="text-sm">Gửi tin nhắn để bắt đầu trò chuyện</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender === 'user'
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                            }`}
                                    >
                                        {msg.sender === 'admin' && (
                                            <p className="text-xs font-semibold mb-1 text-blue-600">
                                                {msg.senderName || 'Admin'}
                                            </p>
                                        )}
                                        <p className="text-sm break-words">{msg.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                                                }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim()}
                                className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </>
    )
}



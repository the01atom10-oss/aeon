'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Withdrawal {
    id: string
    amount: string
    status: string
    bankName: string
    bankAccount: string
    bankAccountName: string
    note: string
    adminNote: string
    createdAt: string
    processedAt: string
}

export default function WithdrawHistoryPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/withdrawal')
            const data = await res.json()
            if (data.success) {
                setWithdrawals(data.data.items)
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: { text: 'Đang chờ', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' },
            APPROVED: { text: 'Đã duyệt', color: 'bg-green-600/20 text-green-300 border-green-500/30' },
            REJECTED: { text: 'Từ chối', color: 'bg-red-600/20 text-red-300 border-red-500/30' },
            PROCESSING: { text: 'Đang xử lý', color: 'bg-blue-600/20 text-blue-300 border-blue-500/30' },
        }
        const badge = badges[status as keyof typeof badges] || badges.PENDING
        return (
            <span className={`px-2 py-1 rounded text-xs border ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen text-white px-4 py-6 flex items-center justify-center">
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white px-4 py-6 space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/app/account/my" className="text-2xl">←</Link>
                <h1 className="text-xl font-bold">Lịch sử rút tiền</h1>
            </div>

            {withdrawals.length === 0 ? (
                <div className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm border border-white/10 text-center">
                    <p className="text-gray-400">Chưa có lịch sử rút tiền</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {withdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-semibold text-lg text-red-400">-{formatCurrency(withdrawal.amount)} $</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(withdrawal.createdAt)}</p>
                                </div>
                                {getStatusBadge(withdrawal.status)}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="bg-gray-700/50 rounded p-3 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Ngân hàng:</span>
                                        <span className="font-semibold">{withdrawal.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Số TK:</span>
                                        <span className="font-mono">{withdrawal.bankAccount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tên:</span>
                                        <span>{withdrawal.bankAccountName}</span>
                                    </div>
                                </div>
                                
                                {withdrawal.note && (
                                    <div>
                                        <span className="text-gray-400">Ghi chú: </span>
                                        <span>{withdrawal.note}</span>
                                    </div>
                                )}
                                {withdrawal.adminNote && (
                                    <div className="bg-blue-600/20 rounded p-2 border border-blue-500/30">
                                        <span className="text-gray-400">Admin: </span>
                                        <span className="text-blue-300">{withdrawal.adminNote}</span>
                                    </div>
                                )}
                                {withdrawal.processedAt && (
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Xử lý lúc:</span>
                                        <span>{formatDate(withdrawal.processedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


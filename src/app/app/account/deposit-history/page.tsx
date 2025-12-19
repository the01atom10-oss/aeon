'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Deposit {
    id: string
    amount: string
    status: string
    paymentMethod: string
    note: string
    adminNote: string
    createdAt: string
    processedAt: string
}

export default function DepositHistoryPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDeposits()
    }, [])

    const fetchDeposits = async () => {
        try {
            const res = await fetch('/api/deposit')
            const data = await res.json()
            if (data.success) {
                setDeposits(data.data.items)
            }
        } catch (error) {
            console.error('Failed to fetch deposits:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: { text: 'Đang chờ', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' },
            APPROVED: { text: 'Đã duyệt', color: 'bg-green-600/20 text-green-300 border-green-500/30' },
            REJECTED: { text: 'Từ chối', color: 'bg-red-600/20 text-red-300 border-red-500/30' },
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
                <h1 className="text-xl font-bold">Lịch sử nạp tiền</h1>
            </div>

            {deposits.length === 0 ? (
                <div className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm border border-white/10 text-center">
                    <p className="text-gray-400">Chưa có lịch sử nạp tiền</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deposits.map((deposit) => (
                        <div key={deposit.id} className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-semibold text-lg">{formatCurrency(deposit.amount)} $</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(deposit.createdAt)}</p>
                                </div>
                                {getStatusBadge(deposit.status)}
                            </div>

                            <div className="space-y-2 text-sm">
                                {deposit.paymentMethod && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Phương thức:</span>
                                        <span>{deposit.paymentMethod}</span>
                                    </div>
                                )}
                                {deposit.note && (
                                    <div>
                                        <span className="text-gray-400">Ghi chú: </span>
                                        <span>{deposit.note}</span>
                                    </div>
                                )}
                                {deposit.adminNote && (
                                    <div className="bg-blue-600/20 rounded p-2 border border-blue-500/30">
                                        <span className="text-gray-400">Admin: </span>
                                        <span className="text-blue-300">{deposit.adminNote}</span>
                                    </div>
                                )}
                                {deposit.processedAt && (
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Xử lý lúc:</span>
                                        <span>{formatDate(deposit.processedAt)}</span>
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


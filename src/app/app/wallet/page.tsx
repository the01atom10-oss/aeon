'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Transaction {
    id: string
    type: string
    amount: string
    description: string
    balanceAfter: string
    createdAt: string
}

interface WalletData {
    balance: string
    vipLevel: {
        name: string
        commissionRate: string
    } | null
}

export default function WalletPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        fetchWallet()
        fetchTransactions()
    }, [])

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/wallet')
            const data = await res.json()
            if (data.success) {
                setWallet(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch wallet:', error)
        }
    }

    const fetchTransactions = async (cursor?: string) => {
        try {
            setLoadingMore(!!cursor)
            const url = cursor
                ? `/api/transactions?cursor=${cursor}`
                : '/api/transactions'
            const res = await fetch(url)
            const data = await res.json()

            if (data.success) {
                if (cursor) {
                    setTransactions((prev) => [...prev, ...data.data.items])
                } else {
                    setTransactions(data.data.items)
                }
                setNextCursor(data.data.nextCursor)
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            CREDIT: 'Nạp',
            DEBIT: 'Trừ',
            REWARD: 'Thưởng',
            COMMISSION: 'Hoa hồng',
            ADMIN_ADJUSTMENT: 'Điều chỉnh',
        }
        return labels[type] || type
    }

    const getTypeColor = (type: string) => {
        if (type === 'DEBIT') return 'text-red-600'
        return 'text-green-600'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ví của tôi</h1>
                <p className="text-gray-600 mt-1">Số dư và lịch sử giao dịch</p>
            </div>

            {/* Balance Card */}
            {wallet && (
                <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <CardContent className="py-6">
                        <p className="text-primary-100 text-sm mb-2">Số dư hiện tại</p>
                        <p className="text-4xl font-bold mb-4">
                            {formatCurrency(wallet.balance)} Credits
                        </p>
                        {wallet.vipLevel && (
                            <div className="bg-white/10 rounded-lg px-4 py-2 inline-block">
                                <span className="text-sm">VIP: {wallet.vipLevel.name}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử giao dịch</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">
                            Chưa có giao dịch nào
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex justify-between items-start border-b pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{tx.description}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(tx.createdAt)}
                                        </p>
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                                            {getTypeLabel(tx.type)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${getTypeColor(tx.type)}`}>
                                            {tx.type === 'DEBIT' ? '-' : '+'}
                                            {formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Sau: {formatCurrency(tx.balanceAfter)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {nextCursor && (
                                <button
                                    onClick={() => fetchTransactions(nextCursor)}
                                    disabled={loadingMore}
                                    className="w-full py-2 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                                >
                                    {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

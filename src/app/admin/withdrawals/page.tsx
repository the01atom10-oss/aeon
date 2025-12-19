'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
    user: {
        id: string
        username: string
        email: string
        phone: string
    }
}

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('PENDING')
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchWithdrawals()
    }, [filter])

    const fetchWithdrawals = async () => {
        setLoading(true)
        try {
            const url = filter ? `/api/admin/withdrawals?status=${filter}` : '/api/admin/withdrawals'
            const res = await fetch(url)
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

    const handleApprove = async (id: string) => {
        const adminNote = prompt('Nhập ghi chú (tùy chọn):')
        if (adminNote === null) return

        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Đã duyệt rút tiền thành công')
                fetchWithdrawals()
            } else {
                alert(data.message)
            }
        } catch (error) {
            alert('Đã xảy ra lỗi')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (id: string) => {
        const adminNote = prompt('Nhập lý do từ chối:')
        if (!adminNote) return

        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Đã từ chối rút tiền')
                fetchWithdrawals()
            } else {
                alert(data.message)
            }
        } catch (error) {
            alert('Đã xảy ra lỗi')
        } finally {
            setProcessing(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Rút tiền</h1>
                <p className="text-gray-600 mt-1">Duyệt và quản lý yêu cầu rút tiền</p>
            </div>

            <div className="flex gap-2">
                {['PENDING', 'APPROVED', 'REJECTED', ''].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            filter === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {status === '' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                    </button>
                ))}
            </div>

            {loading ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-600">Đang tải...</p>
                    </CardContent>
                </Card>
            ) : withdrawals.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-600">Không có yêu cầu rút tiền</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {withdrawals.map((withdrawal) => (
                        <Card key={withdrawal.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {withdrawal.user.username}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {withdrawal.user.email || withdrawal.user.phone}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-red-600">
                                            -{formatCurrency(withdrawal.amount)} $
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {formatDate(withdrawal.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold mb-2">Thông tin ngân hàng:</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngân hàng:</span>
                                            <span className="font-semibold">{withdrawal.bankName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Số TK:</span>
                                            <span className="font-mono">{withdrawal.bankAccount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tên:</span>
                                            <span>{withdrawal.bankAccountName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    {withdrawal.note && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ghi chú:</span>
                                            <span>{withdrawal.note}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                withdrawal.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : withdrawal.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {withdrawal.status}
                                        </span>
                                    </div>
                                    {withdrawal.adminNote && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                            <span className="text-gray-600">Admin: </span>
                                            <span>{withdrawal.adminNote}</span>
                                        </div>
                                    )}
                                </div>

                                {withdrawal.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(withdrawal.id)}
                                            disabled={processing === withdrawal.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                        >
                                            Duyệt (Debit)
                                        </button>
                                        <button
                                            onClick={() => handleReject(withdrawal.id)}
                                            disabled={processing === withdrawal.id}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}


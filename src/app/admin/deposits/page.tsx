'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
    user: {
        id: string
        username: string
        email: string
        phone: string
    }
}

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('PENDING')
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchDeposits()
    }, [filter])

    const fetchDeposits = async () => {
        setLoading(true)
        try {
            const url = filter ? `/api/admin/deposits?status=${filter}` : '/api/admin/deposits'
            const res = await fetch(url)
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

    const handleApprove = async (id: string) => {
        const adminNote = prompt('Nhập ghi chú (tùy chọn):')
        if (adminNote === null) return

        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/deposits/${id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Đã duyệt nạp tiền thành công')
                fetchDeposits()
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
            const res = await fetch(`/api/admin/deposits/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Đã từ chối nạp tiền')
                fetchDeposits()
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
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Nạp tiền</h1>
                <p className="text-gray-600 mt-1">Duyệt và quản lý yêu cầu nạp tiền</p>
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
            ) : deposits.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-600">Không có yêu cầu nạp tiền</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {deposits.map((deposit) => (
                        <Card key={deposit.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {deposit.user.username}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {deposit.user.email || deposit.user.phone}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">
                                            +{formatCurrency(deposit.amount)} $
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {formatDate(deposit.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phương thức:</span>
                                        <span>{deposit.paymentMethod || 'N/A'}</span>
                                    </div>
                                    {deposit.note && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ghi chú:</span>
                                            <span>{deposit.note}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                deposit.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : deposit.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {deposit.status}
                                        </span>
                                    </div>
                                    {deposit.adminNote && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                            <span className="text-gray-600">Admin: </span>
                                            <span>{deposit.adminNote}</span>
                                        </div>
                                    )}
                                </div>

                                {deposit.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(deposit.id)}
                                            disabled={processing === deposit.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                        >
                                            Duyệt (Credit)
                                        </button>
                                        <button
                                            onClick={() => handleReject(deposit.id)}
                                            disabled={processing === deposit.id}
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


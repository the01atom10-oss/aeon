'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface TaskRun {
    id: string
    state: string
    assignedPrice: number
    commissionRate: number
    rewardAmount: number
    totalRefund: number
    createdAt: string
    submittedAt: string | null
    completedAt: string | null
    user: {
        id: string
        username: string
        email: string
    }
    taskProduct: {
        id: string
        name: string
        description: string | null
        imageUrl: string | null
        price: number
    } | null
}

export default function AdminTaskRunsPage() {
    const [taskRuns, setTaskRuns] = useState<TaskRun[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        loadTaskRuns()
    }, [filter])

    const loadTaskRuns = async () => {
        try {
            const url = filter === 'ALL' 
                ? '/api/admin/tasks/runs'
                : `/api/admin/tasks/runs?state=${filter}`
            
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setTaskRuns(data.taskRuns || [])
            }
        } catch (error) {
            console.error('Failed to load task runs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async (runId: string) => {
        if (!confirm('Xác nhận duyệt nhiệm vụ này? User sẽ nhận lại tiền gốc + hoa hồng + 1 lượt quay miễn phí.')) return
        
        setProcessing(runId)
        try {
            console.log('🚀 [ADMIN] Completing task run:', runId)
            const response = await fetch('/api/admin/tasks/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ runId, taskRunId: runId })
            })

            const data = await response.json()
            console.log('📥 [ADMIN] Response:', data)

            if (response.ok) {
                alert('✅ Duyệt thành công! User đã nhận tiền + hoa hồng + 1 lượt quay miễn phí.')
                loadTaskRuns()
            } else {
                const errorMsg = data.error || data.message || 'Có lỗi xảy ra'
                console.error('❌ [ADMIN] Error:', errorMsg, data)
                alert(`❌ ${errorMsg}`)
            }
        } catch (error: any) {
            console.error('❌ [ADMIN] Complete task error:', error)
            alert(`❌ Có lỗi xảy ra: ${error?.message || 'Unknown error'}`)
        } finally {
            setProcessing(null)
        }
    }

    const getStateColor = (state: string) => {
        switch (state) {
            case 'ASSIGNED':
                return 'bg-blue-100 text-blue-700'
            case 'SUBMITTED':
                return 'bg-yellow-100 text-yellow-700'
            case 'COMPLETED':
                return 'bg-green-100 text-green-700'
            case 'CANCELLED':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getStateText = (state: string) => {
        switch (state) {
            case 'ASSIGNED':
                return '⏳ Đã giật - Chờ duyệt'
            case 'SUBMITTED':
                return '⏳ Chờ duyệt'
            case 'COMPLETED':
                return '✅ Hoàn thành'
            case 'CANCELLED':
                return '❌ Đã hủy'
            default:
                return state
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8">Đang tải...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Nhiệm vụ (Task Runs)</h1>
                    <p className="text-gray-600 mt-1">Duyệt các nhiệm vụ "Giật đơn" đã gửi</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'ASSIGNED', 'COMPLETED', 'CANCELLED'].map((state) => (
                    <button
                        key={state}
                        onClick={() => setFilter(state)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            filter === state
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {state === 'ALL' ? 'Tất cả' : getStateText(state)}
                    </button>
                ))}
            </div>

            {/* Task Runs List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        📋 Danh sách ({taskRuns.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {taskRuns.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có nhiệm vụ nào
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {taskRuns.map((run) => (
                                <div
                                    key={run.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            {run.taskProduct?.imageUrl ? (
                                                <Image
                                                    src={run.taskProduct.imageUrl}
                                                    alt={run.taskProduct.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg">
                                                        {run.taskProduct?.name || 'Sản phẩm đã xóa'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        User: <strong>{run.user.username}</strong> ({run.user.email})
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(run.state)}`}>
                                                    {getStateText(run.state)}
                                                </span>
                                            </div>

                                            {/* Financial Info */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                                <div className="bg-gray-50 rounded p-2">
                                                    <p className="text-gray-500 text-xs">Giá sản phẩm</p>
                                                    <p className="font-semibold">${run.assignedPrice.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-green-50 rounded p-2">
                                                    <p className="text-gray-500 text-xs">Hoa hồng</p>
                                                    <p className="font-semibold text-green-600">+${run.rewardAmount.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-orange-50 rounded p-2">
                                                    <p className="text-gray-500 text-xs">Tổng hoàn trả</p>
                                                    <p className="font-semibold text-orange-600">${run.totalRefund.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded p-2">
                                                    <p className="text-gray-500 text-xs">Tỷ lệ hoa hồng</p>
                                                    <p className="font-semibold text-blue-600">{(run.commissionRate * 100).toFixed(2)}%</p>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p>🕐 Tạo: {new Date(run.createdAt).toLocaleString('vi-VN')}</p>
                                                {run.submittedAt && (
                                                    <p>📤 Gửi: {new Date(run.submittedAt).toLocaleString('vi-VN')}</p>
                                                )}
                                                {run.completedAt && (
                                                    <p>✅ Hoàn thành: {new Date(run.completedAt).toLocaleString('vi-VN')}</p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {(run.state === 'ASSIGNED' || run.state === 'SUBMITTED') && (
                                                <div className="mt-3 flex gap-2">
                                                    <Button
                                                        onClick={() => handleComplete(run.id)}
                                                        disabled={processing === run.id}
                                                        className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                                                    >
                                                        {processing === run.id ? '⏳ Đang xử lý...' : '✅ Duyệt & Hoàn tiền'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


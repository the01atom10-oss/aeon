'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { normalizeImageUrl } from '@/lib/image-utils'

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
    const [approvalSettings, setApprovalSettings] = useState({
        autoApproveAll: false,
        autoApproveThreshold: '' as string | number
    })
    const [savingApproval, setSavingApproval] = useState(false)

    useEffect(() => {
        loadTaskRuns()
        loadApprovalSettings()
    }, [filter])

    const loadApprovalSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings/approval')
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setApprovalSettings({
                        autoApproveAll: data.data.autoApproveAll || false,
                        autoApproveThreshold: data.data.autoApproveThreshold || ''
                    })
                }
            }
        } catch (error) {
            console.error('Failed to load approval settings:', error)
        }
    }

    const handleSaveApproval = async () => {
        setSavingApproval(true)
        try {
            const response = await fetch('/api/admin/settings/approval', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    autoApproveAll: approvalSettings.autoApproveAll,
                    autoApproveThreshold: approvalSettings.autoApproveThreshold ? parseFloat(String(approvalSettings.autoApproveThreshold)) : null
                })
            })

            const data = await response.json()

            if (response.ok) {
                alert('✅ Cập nhật cài đặt duyệt đơn thành công!')
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to save approval settings:', error)
            alert('❌ Có lỗi xảy ra')
        } finally {
            setSavingApproval(false)
        }
    }

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

            {/* Cài đặt Duyệt đơn */}
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Cài đặt Duyệt đơn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Cài đặt này áp dụng cho tất cả người dùng. 
                            Đơn hàng có giá trị dưới hạn mức sẽ được tự động duyệt, bất kể số đơn đã hoàn thành.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                                Tự động duyệt tất cả đơn (Giờ cao điểm)
                            </label>
                            <p className="text-xs text-gray-600">
                                Bật chế độ này để tự động duyệt tất cả đơn, bất kể giá trị và số đơn đã hoàn thành
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={approvalSettings.autoApproveAll}
                                onChange={(e) => setApprovalSettings({ ...approvalSettings, autoApproveAll: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Hạn mức tự động duyệt đơn (Giá trị)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={approvalSettings.autoApproveThreshold}
                                onChange={(e) => setApprovalSettings({ ...approvalSettings, autoApproveThreshold: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Nhập mức giá (ví dụ: 100)"
                                min="0"
                                step="0.01"
                                disabled={approvalSettings.autoApproveAll}
                            />
                            <span className="text-sm text-gray-600 whitespace-nowrap">Credits</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Đơn hàng có giá trị ≤ hạn mức này sẽ được tự động duyệt, bất kể số đơn đã hoàn thành.
                            {approvalSettings.autoApproveAll && (
                                <span className="text-orange-600 font-medium"> (Đã tắt vì đang bật chế độ tự động duyệt tất cả)</span>
                            )}
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Ví dụ:</strong> Nếu đặt hạn mức là <strong>100 Credits</strong>, 
                            tất cả đơn hàng có giá ≤ 100 Credits sẽ được tự động duyệt ngay lập tức.
                        </p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSaveApproval}
                            disabled={savingApproval}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {savingApproval ? 'Đang lưu...' : '💾 Lưu cài đặt duyệt đơn'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                                                <img
                                                    src={normalizeImageUrl(run.taskProduct.imageUrl)}
                                                    alt={run.taskProduct.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error('❌ Lỗi load ảnh:', run.taskProduct?.imageUrl, 'URL:', e.currentTarget.src)
                                                        e.currentTarget.src = '/placeholder-product.png'
                                                        e.currentTarget.onerror = null
                                                    }}
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


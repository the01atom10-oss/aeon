'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
    taskProduct: {
        name: string
        imageUrl: string | null
        basePrice: number
    } | null
}

export default function TaskHistoryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [taskRuns, setTaskRuns] = useState<TaskRun[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user) {
            fetchTaskHistory()
        }
    }, [status, session, router])

    const fetchTaskHistory = async () => {
        try {
            const res = await fetch('/api/tasks/history')
            if (res.ok) {
                const data = await res.json()
                setTaskRuns(data.taskRuns || [])
            }
        } catch (error) {
            console.error('Error fetching task history:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'STARTED': return { label: 'Đã bắt đầu', color: 'bg-blue-500/20 text-blue-400' }
            case 'ASSIGNED': return { label: 'Đã khớp đơn', color: 'bg-purple-500/20 text-purple-400' }
            case 'SUBMITTED': return { label: 'Đang chờ duyệt', color: 'bg-yellow-500/20 text-yellow-400' }
            case 'COMPLETED': return { label: 'Thành công', color: 'bg-green-500/20 text-green-400' }
            case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400' }
            default: return { label: state, color: 'bg-gray-500/20 text-gray-400' }
        }
    }

    const filteredTasks = filter === 'ALL' 
        ? taskRuns 
        : taskRuns.filter(t => t.state === filter)

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pb-24">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Lịch sử Giật đơn</h1>
                    <p className="text-white/60">Xem tất cả đơn hàng đã giật</p>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['ALL', 'STARTED', 'ASSIGNED', 'SUBMITTED', 'COMPLETED', 'CANCELLED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                filter === f
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                        >
                            {f === 'ALL' ? 'Tất cả' : getStateLabel(f).label}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {filteredTasks.map((taskRun) => {
                        const stateInfo = getStateLabel(taskRun.state)
                        return (
                            <div
                                key={taskRun.id}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                            >
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    {taskRun.taskProduct?.imageUrl && (
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                            <Image
                                                src={taskRun.taskProduct.imageUrl}
                                                alt={taskRun.taskProduct.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">
                                                    {taskRun.taskProduct?.name || 'Sản phẩm'}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm ${stateInfo.color}`}>
                                                    {stateInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Financial Info */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <span className="text-white/60 text-sm">Giá gốc:</span>
                                                <p className="text-white font-semibold">
                                                    ${taskRun.assignedPrice?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                            {taskRun.rewardAmount && (
                                                <div>
                                                    <span className="text-white/60 text-sm">Hoa hồng:</span>
                                                    <p className="text-green-400 font-semibold">
                                                        +${taskRun.rewardAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                            {taskRun.totalRefund && (
                                                <div>
                                                    <span className="text-white/60 text-sm">Tổng hoàn trả:</span>
                                                    <p className="text-blue-400 font-semibold">
                                                        ${taskRun.totalRefund.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline */}
                                        <div className="text-xs text-white/60 space-y-1">
                                            <div>Tạo: {new Date(taskRun.createdAt).toLocaleString('vi-VN')}</div>
                                            {taskRun.submittedAt && (
                                                <div>Gửi: {new Date(taskRun.submittedAt).toLocaleString('vi-VN')}</div>
                                            )}
                                            {taskRun.completedAt && (
                                                <div>Hoàn thành: {new Date(taskRun.completedAt).toLocaleString('vi-VN')}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredTasks.length === 0 && (
                    <div className="text-center text-white/60 py-12">
                        Chưa có đơn hàng nào
                    </div>
                )}
            </div>
        </div>
    )
}


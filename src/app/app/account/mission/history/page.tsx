'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface TaskRun {
    id: string
    state: string
    assignedPrice: number | null
    commissionRate: number | null
    rewardAmount: number | null
    totalRefund: number | null
    createdAt: string
    submittedAt: string | null
    completedAt: string | null
    taskProduct: {
        name: string
        imageUrl: string | null
        basePrice: number
    } | null
}

export default function MissionHistoryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [taskRuns, setTaskRuns] = useState<TaskRun[]>([])
    const [loading, setLoading] = useState(true)
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user) {
            fetchTaskHistory()
            fetchBalance()
        }
    }, [status, session, router])

    const fetchBalance = async () => {
        try {
            const res = await fetch('/api/wallet')
            if (res.ok) {
                const data = await res.json()
                setBalance(data.balance || 0)
            }
        } catch (error) {
            console.error('Error fetching balance:', error)
        }
    }

    const fetchTaskHistory = async () => {
        try {
            const res = await fetch('/api/tasks/history')
            if (res.ok) {
                const data = await res.json()
                // Chỉ hiển thị các đơn đã hoàn thành (COMPLETED)
                const completedTasks = (data.taskRuns || []).filter((t: TaskRun) => t.state === 'COMPLETED')
                setTaskRuns(completedTasks)
            }
        } catch (error) {
            console.error('Error fetching task history:', error)
        } finally {
            setLoading(false)
        }
    }

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

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                        >
                            ← Quay lại
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Lịch sử phân phối</h1>
                        <p className="text-sm text-white/60 mt-1">Các đơn hàng đã hoàn thành</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(balance.toString())} $</p>
                        <p className="text-xs text-white/60">Số dư ($)</p>
                    </div>
                </div>

                {/* Distribution List */}
                <div className="space-y-4">
                    {taskRuns.map((taskRun) => (
                        <div 
                            key={taskRun.id} 
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-white/60">
                                        Thời gian: {new Date(taskRun.completedAt || taskRun.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                    <p className="text-xs text-white/60 mt-1">Mã đơn: {taskRun.id.slice(0, 16).toUpperCase()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <span className="text-green-400 text-sm">✓</span>
                                    </div>
                                    <span className="text-xs text-green-400 font-semibold">Thành công</span>
                                </div>
                            </div>

                            <div className="flex gap-3 md:gap-4 mb-4">
                                {/* Product Image */}
                                {taskRun.taskProduct?.imageUrl ? (
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/20">
                                        <img
                                            src={taskRun.taskProduct.imageUrl.startsWith('http') 
                                                ? taskRun.taskProduct.imageUrl 
                                                : taskRun.taskProduct.imageUrl.startsWith('/') 
                                                    ? taskRun.taskProduct.imageUrl 
                                                    : `/${taskRun.taskProduct.imageUrl}`}
                                            alt={taskRun.taskProduct.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.png'
                                                e.currentTarget.onerror = null
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center text-3xl border border-white/20">
                                        📦
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-lg mb-1">
                                        {taskRun.taskProduct?.name || 'Sản phẩm'}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm text-white/80">
                                            Giá: {formatCurrency((taskRun.assignedPrice || taskRun.taskProduct?.basePrice || 0).toString())} $
                                        </span>
                                        <span className="text-sm text-white/60">x 1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">Tổng tiền phân phối:</span>
                                    <span className="font-semibold text-white">
                                        {formatCurrency((taskRun.assignedPrice || 0).toString())} $
                                    </span>
                                </div>
                                {taskRun.rewardAmount && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-white/70">Lợi nhuận (Hoa hồng):</span>
                                        <span className="font-semibold text-green-400">
                                            +{formatCurrency(taskRun.rewardAmount.toString())} $
                                        </span>
                                    </div>
                                )}
                                {taskRun.totalRefund && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-white/70">Số tiền hoàn nhập:</span>
                                        <span className="font-semibold text-orange-400">
                                            {formatCurrency(taskRun.totalRefund.toString())} $
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {taskRuns.length === 0 && (
                        <div className="text-center py-12 text-white/60">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-lg mb-2 font-semibold">Chưa có lịch sử phân phối</p>
                            <p className="text-sm">Các đơn hàng đã hoàn thành sẽ hiển thị ở đây</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


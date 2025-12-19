'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import ImageSlider from '@/components/ui/ImageSlider'

interface UserData {
    balance: string
    vipLevel: {
        name: string
        commissionRate: string
    } | null
}

interface TaskProduct {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
}

interface TaskRunData {
    runId: string
    taskProduct: TaskProduct
    assignedPrice: number
    commissionRate: number
    rewardAmount: number
    totalRefund: number
}

interface PendingTaskRun {
    id: string
    state: string
    assignedPrice: number
    rewardAmount: number
    totalRefund: number
    createdAt: string
    submittedAt: string | null
    taskProduct: {
        name: string
        imageUrl: string | null
    } | null
}

export default function MissionPage() {
    const router = useRouter()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [currentTaskRun, setCurrentTaskRun] = useState<TaskRunData | null>(null)
    const [pendingTasks, setPendingTasks] = useState<PendingTaskRun[]>([])
    const [loading, setLoading] = useState(false)
    const [starting, setStarting] = useState(false)
    
    // Slider images từ public/img
    const sliderImages = [
        '/img/6203955275983686762.jpg',
        '/img/6203998122577431836.jpg',
        '/img/6203998122577431837.jpg',
        '/img/6203998122577431838.jpg',
        '/img/6203998122577431839.jpg',
        '/img/6203998122577431840.jpg',
        '/img/6203998122577431841.jpg',
        '/img/6203998122577431842.jpg',
        '/img/6203998122577431843.jpg',
        '/img/6203998122577431844.jpg',
        '/img/6203998122577431846.jpg',
        '/img/6203998122577431848.jpg',
        '/img/6203998122577431850.jpg',
        '/img/6203998122577431851.jpg',
        '/img/6203998122577431852.jpg',
        '/img/6203998122577431853.jpg',
        '/img/6203998122577431855.jpg',
        '/img/6203998122577431856.jpg',
    ]

    useEffect(() => {
        fetchUserData()
        fetchPendingTasks()
    }, [])

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/balance')
            const data = await res.json()
            if (data.success) {
                setUserData(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error)
        }
    }

    const fetchPendingTasks = async () => {
        try {
            const res = await fetch('/api/tasks/history')
            if (res.ok) {
                const data = await res.json()
                // Lọc các đơn đang chờ duyệt (ASSIGNED hoặc SUBMITTED)
                const pending = (data.taskRuns || []).filter((tr: PendingTaskRun) => 
                    tr.state === 'ASSIGNED' || tr.state === 'SUBMITTED'
                )
                setPendingTasks(pending)
            }
        } catch (error) {
            console.error('Failed to fetch pending tasks:', error)
        }
    }

    const handleStartTask = async () => {
        setStarting(true)
        try {
            // Fetch available tasks
            const tasksRes = await fetch('/api/tasks')
            const tasksData = await tasksRes.json()
            
            console.log('📋 Tasks response:', tasksData)
            
            if (tasksData.success && tasksData.data && tasksData.data.length > 0) {
                // Pick a random task (usually first one or based on VIP level)
                const taskId = tasksData.data[0].id
                console.log('🎯 Selected task ID:', taskId)
                
                // Start the task - API will assign a TaskProduct
                const startRes = await fetch('/api/tasks/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId }),
                })
                
                const startData = await startRes.json()
                console.log('🚀 Start task response:', startData)
                
                if (startData.success) {
                    // startData.data contains: runId, taskProduct, assignedPrice, commissionRate, rewardAmount, totalRefund
                    setCurrentTaskRun(startData.data)
                } else {
                    alert(startData.message || startData.error || 'Không thể bắt đầu nhiệm vụ')
                }
            } else {
                const errorMsg = tasksData.message || 'Không có nhiệm vụ phù hợp với cấp VIP của bạn. Vui lòng nạp thêm tiền để nâng cấp VIP level.'
                alert(errorMsg)
                console.error('❌ No tasks available:', tasksData)
                
                // Show more details in console
                if (tasksData.data && tasksData.data.length === 0) {
                    console.log('💡 Gợi ý:')
                    console.log('   1. Kiểm tra xem có Task nào trong database không')
                    console.log('   2. Kiểm tra số dư của user có đủ để đạt VIP level không')
                    console.log('   3. Chạy: npx tsx prisma/seed-tasks.ts để tạo tasks')
                }
            }
        } catch (error) {
            console.error('Start task error:', error)
            alert('Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setStarting(false)
        }
    }

    const handleSubmitTask = async () => {
        if (!currentTaskRun) return
        
        setLoading(true)
        try {
            const response = await fetch('/api/tasks/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ runId: currentTaskRun.runId })
            })
            
            const data = await response.json()
            
            if (data.success) {
                alert('✅ Gửi đơn thành công! Số dư đã được trừ. Chờ admin duyệt để nhận tiền + hoa hồng.')
                setCurrentTaskRun(null)
                fetchUserData()
                fetchPendingTasks()
            } else {
                alert('❌ ' + (data.message || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Submit task error:', error)
            alert('❌ Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    if (!userData) {
        return (
            <div className="min-h-screen text-white px-4 py-6 flex items-center justify-center">
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white px-4 py-4 space-y-4 pb-24">
            {/* Header with Category Tags */}
            <div>
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="bg-yellow-600/30 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30 whitespace-nowrap">
                        Thành viên Vàng
                    </div>
                    <span className="text-xs text-gray-400">
                        Điện thoại di động | Từ lành | Máy tính | Chuột | Xe máy | Mũ
                    </span>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold">Hoa hồng 0.5%</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(userData.balance)} $</p>
                        <p className="text-xs text-gray-400">Số dư($)</p>
                    </div>
                </div>
            </div>

            {/* Image Slider - 9Carat */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-56">
                <ImageSlider images={sliderImages} interval={5000} />
                
                {/* Overlay with branding */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none z-20">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-xl font-bold tracking-wider drop-shadow-lg">9CARAT</p>
                        <p className="text-xs text-white/90 drop-shadow-lg mt-1">Nền tảng phần thưởng</p>
                    </div>
                </div>

                {/* Order Matched Badge */}
                {currentTaskRun && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                        <div className="bg-yellow-500/95 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            091***5534 - Khớp thành công ✓
                        </div>
                    </div>
                )}
            </div>

            {/* Task Display - Hiển thị sản phẩm đã match */}
            {currentTaskRun && (
                <div className="bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-xl">
                    <div className="flex gap-3 mb-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 relative flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl overflow-hidden shadow-lg">
                            {currentTaskRun.taskProduct.imageUrl ? (
                                <Image
                                    src={currentTaskRun.taskProduct.imageUrl}
                                    alt={currentTaskRun.taskProduct.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                    🛍️
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="font-bold text-lg">{currentTaskRun.taskProduct.name}</p>
                            {currentTaskRun.taskProduct.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {currentTaskRun.taskProduct.description}
                                </p>
                            )}
                            <div className="mt-2 inline-block bg-blue-600/30 px-2 py-1 rounded text-xs">
                                {userData?.vipLevel?.name || 'Thành Viên'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 bg-gray-900/40 rounded-xl p-3">
                        <div className="flex justify-between">
                            <span className="text-gray-300">Giá sản phẩm:</span>
                            <span className="font-semibold">${currentTaskRun.assignedPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Hoa hồng ({(currentTaskRun.commissionRate * 100).toFixed(2)}%):</span>
                            <span className="font-semibold text-green-400">
                                +${currentTaskRun.rewardAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="text-gray-300">Tổng hoàn trả:</span>
                            <span className="font-bold text-orange-400">
                                ${currentTaskRun.totalRefund.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                        <p className="text-xs text-yellow-200">
                            ⚠️ Khi nhấn "Gửi đơn hàng", <strong>${currentTaskRun.assignedPrice.toFixed(2)}</strong> sẽ được trừ khỏi số dư. 
                            Sau khi admin duyệt, bạn sẽ nhận lại <strong>${currentTaskRun.totalRefund.toFixed(2)}</strong> (gốc + hoa hồng).
                        </p>
                    </div>

                    <button 
                        onClick={handleSubmitTask}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl py-4 font-bold text-lg shadow-lg transition-all disabled:opacity-50 transform hover:scale-[1.02]"
                    >
                        {loading ? 'Đang xử lý...' : '💰 Gửi đơn hàng'}
                    </button>
                </div>
            )}

            {/* Action Button - Only show if no current task */}
            {!currentTaskRun && (
                <button 
                    onClick={handleStartTask}
                    disabled={starting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl py-5 font-bold text-xl shadow-2xl transition-all disabled:opacity-50 transform hover:scale-[1.02] relative overflow-hidden"
                >
                    <span className="relative z-10">{starting ? 'Đang tìm đơn...' : 'Nhận đơn hàng'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer"></div>
                </button>
            )}

            {/* Pending Tasks - Đơn đã giật đang chờ duyệt */}
            {pendingTasks.length > 0 && (
                <div className="bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-xl">
                    <h3 className="font-bold mb-4 text-center border-b border-white/10 pb-2">
                        ⏳ Đơn đã giật - Đang chờ duyệt ({pendingTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingTasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-gray-900/50 rounded-xl p-3 border border-yellow-500/30"
                            >
                                <div className="flex gap-3">
                                    {task.taskProduct?.imageUrl && (
                                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                                            <Image
                                                src={task.taskProduct.imageUrl}
                                                alt={task.taskProduct.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1">
                                            {task.taskProduct?.name || 'Sản phẩm'}
                                        </p>
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <p>Giá: ${task.assignedPrice?.toFixed(2) || 0}</p>
                                            <p>Hoa hồng: +${task.rewardAmount?.toFixed(2) || 0}</p>
                                            <p>Tổng hoàn trả: ${task.totalRefund?.toFixed(2) || 0}</p>
                                        </div>
                                        <div className="mt-2">
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                {task.state === 'ASSIGNED' ? '⏳ Đang chờ duyệt' : '📤 Đã gửi'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Statistics Card - Thành quả hôm nay */}
            <div className="bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-xl">
                <h3 className="font-bold mb-4 text-center border-b border-white/10 pb-2">Thành quả hôm nay</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Số dư tài khoản</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(userData.balance)} $</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Số đơn hoàn thành</p>
                        <p className="text-lg font-bold text-blue-400">1/80</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-300">Hoa hồng hôm qua</span>
                        <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-300">Hoa hồng hôm nay</span>
                        <span className="font-semibold text-green-400">$1.10</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-300">Số tiền đóng băng</span>
                        <span className="font-semibold text-orange-400">$0.00</span>
                    </div>
                </div>
            </div>

            {/* Platform Rules */}
            <div className="bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold mb-3">GIỚI THIỆU QUY TẮC NỀN TẢNG</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    Khi bạn trở thành thành viên 9Carat, bạn sẽ nhận được các mã sản phẩm có liên quan về đơn đặt hàng, 
                    bao gồm thông tin sản phẩm chi tiết đơn hàng, giá trị sản phẩm, số lượng ...vv.. 9Carat - nơi tạo nên 
                    sự khác biệt. Thành viên của 9Carat sẽ là nhà trung gian giúp xác nhận đơn hàng giữa các NHÀ SẢN XUẤT & 
                    QUÝ ĐỐI TÁC (người đặt mua).
                </p>
            </div>
        </div>
    )
}


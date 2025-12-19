'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface Task {
    id: string
    name: string
    description: string
    basePrice: string
    rewardRate: string
    vipLevel: {
        name: string
        minBalance: string
    }
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState<string | null>(null)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks')
            const data = await res.json()
            if (data.success) {
                setTasks(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartTask = async (taskId: string) => {
        setStarting(taskId)
        try {
            const res = await fetch('/api/tasks/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId }),
            })

            const data = await res.json()

            if (data.success) {
                // Redirect to task run page
                window.location.href = `/app/tasks/${data.data.id}`
            } else {
                alert(data.message || 'Không thể bắt đầu nhiệm vụ')
            }
        } catch (error) {
            alert('Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setStarting(null)
        }
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
                <h1 className="text-2xl font-bold text-gray-900">Nhiệm vụ</h1>
                <p className="text-gray-600 mt-1">
                    Chọn và hoàn thành nhiệm vụ để nhận thưởng
                </p>
            </div>

            {tasks.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-600">
                            Không có nhiệm vụ phù hợp với cấp VIP của bạn
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((task) => {
                        const rewardAmount = (
                            parseFloat(task.basePrice) * parseFloat(task.rewardRate)
                        ).toFixed(2)

                        return (
                            <Card key={task.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{task.name}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {task.description}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            {task.vipLevel.name}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giá trị:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(task.basePrice)} Credits
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tỷ lệ thưởng:</span>
                                        <span className="font-semibold">
                                            {formatPercentage(task.rewardRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-3">
                                        <span className="text-gray-600">Phần thưởng:</span>
                                        <span className="font-bold text-green-600">
                                            +{formatCurrency(rewardAmount)} Credits
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => handleStartTask(task.id)}
                                        disabled={starting === task.id}
                                        className="w-full mt-4"
                                    >
                                        {starting === task.id ? 'Đang bắt đầu...' : 'Bắt đầu'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

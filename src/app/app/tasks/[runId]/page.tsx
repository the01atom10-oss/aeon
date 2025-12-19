'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

export default function TaskRunPage() {
    const params = useParams()
    const router = useRouter()
    const runId = params.runId as string

    const [submitting, setSubmitting] = useState(false)
    const [taskData] = useState({
        itemTitle: 'Sản phẩm mẫu',
        itemDescription: 'Đánh giá sản phẩm này',
        assignedPrice: '100',
        rewardAmount: '10',
    })

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const res = await fetch(`/api/tasks/${runId}/submit`, {
                method: 'POST',
            })

            const data = await res.json()

            if (data.success) {
                alert(`Hoàn thành! Bạn đã nhận ${formatCurrency(data.data.rewardAmount)} Credits`)
                router.push('/app/account')
            } else {
                alert(data.message || 'Không thể hoàn thành nhiệm vụ')
                setSubmitting(false)
            }
        } catch (error) {
            alert('Đã xảy ra lỗi. Vui lòng thử lại.')
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Quay lại
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Nhiệm vụ</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin nhiệm vụ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">{taskData.itemTitle}</h3>
                        <p className="text-gray-600 mt-1">{taskData.itemDescription}</p>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Giá trị:</span>
                            <span className="font-semibold">
                                {formatCurrency(taskData.assignedPrice)} Credits
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phần thưởng:</span>
                            <span className="font-bold text-green-600">
                                +{formatCurrency(taskData.rewardAmount)} Credits
                            </span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            📝 Trong ứng dụng thực tế, đây là nơi bạn sẽ thực hiện nhiệm vụ
                            (đánh giá sản phẩm, hoàn thành khảo sát, v.v.)
                        </p>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full"
                        size="lg"
                    >
                        {submitting ? 'Đang hoàn thành...' : 'Hoàn thành nhiệm vụ'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

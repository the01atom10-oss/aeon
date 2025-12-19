'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface VipLevel {
    id: string
    name: string
    minBalance: string
    commissionRate: string
    isActive: boolean
    sortOrder: number
}

export default function VipLevelsPage() {
    const [vipLevels, setVipLevels] = useState<VipLevel[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVipLevels()
    }, [])

    const fetchVipLevels = async () => {
        try {
            const res = await fetch('/api/admin/vip-levels')
            const data = await res.json()
            if (data.success) {
                setVipLevels(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch VIP levels:', error)
        } finally {
            setLoading(false)
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">VIP Levels</h1>
                <p className="text-gray-600 mt-1">Quản lý cấp độ VIP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vipLevels.map((level) => (
                    <Card key={level.id} className={!level.isActive ? 'opacity-60' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{level.name}</span>
                                {!level.isActive && (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                        Inactive
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-600">Min Balance</p>
                                <p className="font-semibold">
                                    {formatCurrency(level.minBalance)} Credits
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Commission Rate</p>
                                <p className="font-bold text-primary-600">
                                    {formatPercentage(level.commissionRate)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                    <p className="text-sm text-blue-800">
                        💡 Để thêm/sửa/xóa VIP levels, sử dụng API hoặc truy cập database
                        trực tiếp. UI CRUD có thể được mở rộng sau.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

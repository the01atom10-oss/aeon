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
    maxOrders?: number
    autoApproveLimit?: number
    isActive: boolean
    sortOrder: number
}

export default function VipLevelsPage() {
    const [vipLevels, setVipLevels] = useState<VipLevel[]>([])
    const [loading, setLoading] = useState(true)
    const [editingLevel, setEditingLevel] = useState<VipLevel | null>(null)
    const [formData, setFormData] = useState({
        minBalance: '',
        commissionRate: '',
        maxOrders: '',
        autoApproveLimit: '',
        isActive: true,
        sortOrder: 0
    })

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

    const handleEdit = (level: VipLevel) => {
        setEditingLevel(level)
        setFormData({
            minBalance: level.minBalance, // Chỉ chỉnh sửa minBalance
            commissionRate: level.commissionRate,
            maxOrders: level.maxOrders?.toString() || '',
            autoApproveLimit: level.autoApproveLimit?.toString() || '',
            isActive: level.isActive,
            sortOrder: level.sortOrder
        })
    }

    const handleUpdateVipLevel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLevel) return

        try {
            // Chỉ gửi minBalance để cập nhật giới hạn credit
            const response = await fetch(`/api/admin/vip-levels/${editingLevel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    minBalance: formData.minBalance,
                    commissionRate: formData.commissionRate, // Giữ nguyên các giá trị khác
                    maxOrders: formData.maxOrders || undefined,
                    autoApproveLimit: formData.autoApproveLimit || undefined,
                    isActive: formData.isActive,
                    sortOrder: formData.sortOrder
                })
            })

            const data = await response.json()

            if (response.ok) {
                alert(`✅ Đã cập nhật giới hạn Credit cho VIP ${editingLevel.name} thành công!`)
                setEditingLevel(null)
                setFormData({
                    minBalance: '',
                    commissionRate: '',
                    maxOrders: '',
                    autoApproveLimit: '',
                    isActive: true,
                    sortOrder: 0
                })
                fetchVipLevels()
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to update VIP level:', error)
            alert('❌ Có lỗi xảy ra')
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
                                <p className="text-sm text-gray-600">Số dư tối thiểu (Credit)</p>
                                <p className="font-semibold">
                                    {formatCurrency(level.minBalance)} Credits
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tỷ lệ hoa hồng</p>
                                <p className="font-bold text-primary-600">
                                    {formatPercentage(level.commissionRate)}
                                </p>
                            </div>
                            {level.maxOrders && (
                                <div>
                                    <p className="text-sm text-gray-600">Số đơn tối đa</p>
                                    <p className="font-semibold">{level.maxOrders}</p>
                                </div>
                            )}
                            {level.autoApproveLimit !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-600">Tự động duyệt</p>
                                    <p className="font-semibold">{level.autoApproveLimit} đơn đầu</p>
                                </div>
                            )}
                            <div className="pt-2">
                                <button
                                    onClick={() => handleEdit(level)}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    ⚙️ Điều chỉnh giới hạn Credit
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Credit Limit Modal */}
            {editingLevel && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Điều chỉnh giới hạn Credit
                            </h2>
                            <button
                                onClick={() => {
                                    setEditingLevel(null)
                                    setFormData({
                                        minBalance: '',
                                        commissionRate: '',
                                        maxOrders: '',
                                        autoApproveLimit: '',
                                        isActive: true,
                                        sortOrder: 0
                                    })
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900">VIP Level: {editingLevel.name}</p>
                            <p className="text-xs text-blue-700 mt-1">
                                Giới hạn hiện tại: {formatCurrency(editingLevel.minBalance)} Credits
                            </p>
                        </div>

                        <form onSubmit={handleUpdateVipLevel} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giới hạn Credit mới (Số dư tối thiểu) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.minBalance}
                                    onChange={(e) => setFormData({ ...formData, minBalance: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                    required
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 User cần có số dư ≥ {formData.minBalance || '0'} Credits để đạt VIP level {editingLevel.name}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    💾 Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingLevel(null)
                                        setFormData({
                                            minBalance: '',
                                            commissionRate: '',
                                            maxOrders: '',
                                            autoApproveLimit: '',
                                            isActive: true,
                                            sortOrder: 0
                                        })
                                    }}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

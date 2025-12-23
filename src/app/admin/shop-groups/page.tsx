'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ShopGroup {
    id: string
    name: string
    description: string | null
    vipLevel: {
        id: string
        name: string
        commissionRate: number
        maxOrders: number
        autoApproveLimit: number
    }
    isActive: boolean
    sortOrder: number
    _count: {
        products: number
        taskProducts: number
    }
}

interface TaskProduct {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    basePrice: number
    vipLevel: {
        id: string
        name: string
    } | null
    isActive: boolean
    stock: number
    isInGroup?: boolean
}

interface VipLevel {
    id: string
    name: string
}

export default function AdminShopGroupsPage() {
    const [shopGroups, setShopGroups] = useState<ShopGroup[]>([])
    const [vipLevels, setVipLevels] = useState<VipLevel[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [selectedShopGroup, setSelectedShopGroup] = useState<string | null>(null)
    const [taskProducts, setTaskProducts] = useState<TaskProduct[]>([])
    const [productsInGroup, setProductsInGroup] = useState<any[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        vipLevelId: '',
        isActive: true,
        sortOrder: 0
    })
    const [editingGroup, setEditingGroup] = useState<ShopGroup | null>(null)

    useEffect(() => {
        loadShopGroups()
        loadVipLevels()
    }, [])

    const loadShopGroups = async () => {
        try {
            const response = await fetch('/api/admin/shop-groups')
            if (response.ok) {
                const data = await response.json()
                setShopGroups(data.data || [])
            }
        } catch (error) {
            console.error('Failed to load shop groups:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadVipLevels = async () => {
        try {
            const response = await fetch('/api/admin/vip-levels')
            if (response.ok) {
                const data = await response.json()
                setVipLevels(data.data || [])
            }
        } catch (error) {
            console.error('Failed to load VIP levels:', error)
        }
    }

    const handleManageProducts = async (shopGroupId: string) => {
        setSelectedShopGroup(shopGroupId)
        setLoadingProducts(true)
        try {
            const response = await fetch(`/api/admin/shop-groups/${shopGroupId}/products`)
            if (response.ok) {
                const data = await response.json()
                setTaskProducts(data.data.allProducts || [])
                setProductsInGroup(data.data.productsInGroup || [])
            } else {
                alert('❌ Không thể tải danh sách sản phẩm')
            }
        } catch (error) {
            console.error('Failed to load products:', error)
            alert('❌ Có lỗi xảy ra')
        } finally {
            setLoadingProducts(false)
        }
    }

    const handleAddProduct = async (taskProductId: string) => {
        if (!selectedShopGroup) return
        
        try {
            const response = await fetch(`/api/admin/shop-groups/${selectedShopGroup}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskProductId })
            })
            
            if (response.ok) {
                alert('✅ Đã thêm sản phẩm vào gian hàng!')
                handleManageProducts(selectedShopGroup) // Reload
            } else {
                const data = await response.json()
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to add product:', error)
            alert('❌ Có lỗi xảy ra')
        }
    }

    const handleRemoveProduct = async (taskProductId: string) => {
        if (!selectedShopGroup) return
        
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi gian hàng?')) return
        
        try {
            const response = await fetch(
                `/api/admin/shop-groups/${selectedShopGroup}/products?taskProductId=${taskProductId}`,
                { method: 'DELETE' }
            )
            
            if (response.ok) {
                alert('✅ Đã xóa sản phẩm khỏi gian hàng!')
                handleManageProducts(selectedShopGroup) // Reload
            } else {
                const data = await response.json()
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to remove product:', error)
            alert('❌ Có lỗi xảy ra')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingGroup 
                ? `/api/admin/shop-groups/${editingGroup.id}`
                : '/api/admin/shop-groups'
            const method = editingGroup ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                alert(editingGroup ? '✅ Cập nhật gian hàng thành công!' : '✅ Tạo gian hàng thành công!')
                setShowForm(false)
                setEditingGroup(null)
                setFormData({
                    name: '',
                    description: '',
                    vipLevelId: '',
                    isActive: true,
                    sortOrder: 0
                })
                loadShopGroups()
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to save shop group:', error)
            alert('❌ Có lỗi xảy ra')
        }
    }

    const handleEdit = (group: ShopGroup) => {
        setEditingGroup(group)
        setFormData({
            name: group.name,
            description: group.description || '',
            vipLevelId: group.vipLevel.id,
            isActive: group.isActive,
            sortOrder: group.sortOrder
        })
        setShowForm(true)
    }

    const handleDelete = async (groupId: string, groupName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa gian hàng "${groupName}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/shop-groups/${groupId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (response.ok) {
                alert('✅ Đã xóa gian hàng thành công!')
                loadShopGroups()
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to delete shop group:', error)
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
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.05\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
                    }}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/40"></div>
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 px-4 py-6 max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Quản lý Gian hàng</h1>
                        <p className="text-sm text-white/60 mt-1">Tạo và quản lý các nhóm gian hàng</p>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm) {
                                setShowForm(false)
                                setEditingGroup(null)
                                setFormData({
                                    name: '',
                                    description: '',
                                    vipLevelId: '',
                                    isActive: true,
                                    sortOrder: 0
                                })
                            } else {
                                setShowForm(true)
                            }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all shadow-xl"
                    >
                        {showForm ? 'Đóng' : '+ Tạo gian hàng'}
                    </button>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingGroup ? 'Sửa gian hàng' : 'Tạo gian hàng mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Tên gian hàng *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    required
                                    placeholder="ĐỒNG, BẠC, VÀNG, KIM CƯƠNG, PREMIUM VIP"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">VIP Level *</label>
                                <select
                                    value={formData.vipLevelId}
                                    onChange={(e) => setFormData({ ...formData, vipLevelId: e.target.value })}
                                    className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    required
                                >
                                    <option value="">Chọn VIP level</option>
                                    {vipLevels.map((level) => (
                                        <option key={level.id} value={level.id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Thứ tự</label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                    <label htmlFor="isActive" className="text-white/70">Kích hoạt</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl py-3 font-semibold text-white transition-all shadow-xl"
                                >
                                    {editingGroup ? 'Cập nhật' : 'Tạo gian hàng'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingGroup(null)
                                        setFormData({
                                            name: '',
                                            description: '',
                                            vipLevelId: '',
                                            isActive: true,
                                            sortOrder: 0
                                        })
                                    }}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors border border-white/10"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Shop Groups List */}
                <div className="bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/18 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopGroups.map((group) => (
                            <Card key={group.id} className="bg-white/5 border-white/10">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <div className="text-4xl mb-3">
                                            {group.name === 'ĐỒNG' ? '🥉' :
                                             group.name === 'BẠC' ? '🥈' :
                                             group.name === 'VÀNG' ? '🥇' :
                                             group.name === 'BẠCH KIM' ? '💎' :
                                             group.name === 'KIM CƯƠNG' ? '💠' :
                                             group.name === 'PREMIUM VIP' ? '👑' : '🏪'}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-white">{group.name}</h3>
                                        {group.description && (
                                            <p className="text-sm text-white/70 mb-3">{group.description}</p>
                                        )}
                                        <div className="space-y-1 text-sm text-white/60 mb-4">
                                            <p>VIP: {group.vipLevel.name}</p>
                                            <p>Hoa hồng: {(Number(group.vipLevel.commissionRate) * 100).toFixed(1)}%</p>
                                            <p>Tối đa: {group.vipLevel.maxOrders} đơn</p>
                                            <p>Sản phẩm giật đơn: {group._count.taskProducts || 0}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                group.isActive 
                                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}>
                                                {group.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                            <button
                                                onClick={() => handleManageProducts(group.id)}
                                                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium transition-colors"
                                            >
                                                Quản lý sản phẩm
                                            </button>
                                            <button
                                                onClick={() => handleEdit(group)}
                                                className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium transition-colors"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id, group.name)}
                                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-full text-xs font-medium transition-colors"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {shopGroups.length === 0 && (
                        <p className="text-center text-white/60 py-8">
                            Chưa có gian hàng nào. Hãy tạo gian hàng đầu tiên!
                        </p>
                    )}
                </div>

                {/* Modal quản lý sản phẩm */}
                {selectedShopGroup && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Quản lý sản phẩm giật đơn</h2>
                                    <button
                                        onClick={() => {
                                            setSelectedShopGroup(null)
                                            setTaskProducts([])
                                            setProductsInGroup([])
                                        }}
                                        className="text-white/70 hover:text-white text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                {loadingProducts ? (
                                    <div className="flex justify-center items-center py-12">
                                        <LoadingSpinner size="lg" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Sản phẩm đã có trong gian hàng */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">
                                                Sản phẩm trong gian hàng ({productsInGroup.length})
                                            </h3>
                                            {productsInGroup.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {productsInGroup.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                {item.taskProduct.imageUrl && (
                                                                    <img
                                                                        src={item.taskProduct.imageUrl}
                                                                        alt={item.taskProduct.name}
                                                                        className="w-12 h-12 rounded-lg object-cover"
                                                                    />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white font-medium truncate">
                                                                        {item.taskProduct.name}
                                                                    </p>
                                                                    <p className="text-white/60 text-sm">
                                                                        {Number(item.taskProduct.basePrice).toLocaleString('vi-VN')} đ
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveProduct(item.taskProductId)}
                                                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-white/60 text-center py-8">
                                                    Chưa có sản phẩm nào trong gian hàng
                                                </p>
                                            )}
                                        </div>

                                        {/* Danh sách tất cả sản phẩm */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">
                                                Tất cả sản phẩm giật đơn
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {taskProducts.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className={`bg-white/5 rounded-xl p-4 border ${
                                                            product.isInGroup
                                                                ? 'border-green-500/30 bg-green-500/10'
                                                                : 'border-white/10'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            {product.imageUrl && (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-medium truncate">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-white/60 text-sm">
                                                                    {product.basePrice.toLocaleString('vi-VN')} đ
                                                                </p>
                                                                {product.vipLevel && (
                                                                    <p className="text-white/50 text-xs">
                                                                        VIP: {product.vipLevel.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {product.isInGroup ? (
                                                            <div className="text-center">
                                                                <span className="text-green-300 text-sm font-medium">
                                                                    ✓ Đã có trong gian hàng
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddProduct(product.id)}
                                                                className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                Thêm vào gian hàng
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


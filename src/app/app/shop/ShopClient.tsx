'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { normalizeImageUrl } from '@/lib/image-utils'

interface TaskProduct {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    basePrice: number
    stock: number
    vipLevel: {
        id: string
        name: string
    } | null
}

interface ShopGroupTaskProduct {
    id: string
    taskProductId: string
    sortOrder: number
    taskProduct: TaskProduct
}

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
    taskProducts: ShopGroupTaskProduct[]
    _count: {
        products: number
        taskProducts: number
    }
}

export default function ShopClient() {
    const { data: session } = useSession()
    const [shopGroups, setShopGroups] = useState<ShopGroup[]>([])
    const [selectedShopGroup, setSelectedShopGroup] = useState<ShopGroup | null>(null)
    const [taskProducts, setTaskProducts] = useState<TaskProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        loadShopGroups()
        loadBalance()
    }, [])

    useEffect(() => {
        if (selectedShopGroup) {
            // Lấy TaskProduct từ shopGroup đã chọn
            const products = selectedShopGroup.taskProducts.map(tp => tp.taskProduct)
            setTaskProducts(products)
            setLoading(false)
        } else {
            setTaskProducts([])
            setLoading(false)
        }
    }, [selectedShopGroup])

    const loadShopGroups = async () => {
        try {
            const response = await fetch('/api/shop/groups')
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

    const handleSelectShopGroup = async (shopGroup: ShopGroup) => {
        try {
            // Gọi API chọn gian hàng
            const response = await fetch('/api/shop/select-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    shopGroupId: shopGroup.id,
                    shopGroupName: shopGroup.name 
                })
            })

            if (response.ok) {
                // Tự động mở chat widget
                window.dispatchEvent(new CustomEvent('openChat'))
                
                // Set selected shop group
                setSelectedShopGroup(shopGroup)
            } else {
                alert('Có lỗi xảy ra khi chọn gian hàng')
            }
        } catch (error) {
            console.error('Failed to select shop group:', error)
            alert('Có lỗi xảy ra')
        }
    }

    const loadBalance = async () => {
        try {
            const response = await fetch('/api/balance')
            if (response.ok) {
                const data = await response.json()
                setBalance(data.balance || 0)
            }
        } catch (error) {
            console.error('Failed to load balance:', error)
        }
    }

    const handleViewProduct = (product: TaskProduct) => {
        // Chuyển đến trang giật đơn với sản phẩm này
        window.location.href = `/app/tasks?productId=${product.id}`
    }

    if (loading) {
        return <div className="flex justify-center p-8">Đang tải...</div>
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-6 px-2 sm:px-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">🛍️ Cửa hàng</h1>
                        <p className="text-purple-100 text-sm sm:text-base md:text-lg">
                            Mua sản phẩm bằng Credits
                        </p>
                    </div>
                    <div className="text-left sm:text-right bg-white/20 rounded-lg sm:rounded-xl p-3 sm:p-4 w-full sm:w-auto">
                        <p className="text-xs sm:text-sm opacity-90">Số dư của bạn</p>
                        <p className="text-2xl sm:text-3xl font-bold">{balance.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm">Credits</p>
                    </div>
                </div>
            </div>

            {/* Shop Groups Selection */}
            {!selectedShopGroup && shopGroups.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Chọn gian hàng</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopGroups.map((group) => (
                            <Card 
                                key={group.id} 
                                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] active:scale-100 bg-white/8 backdrop-blur-xl border border-white/18"
                            >
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
                                        <div className="space-y-1 text-sm text-white/60">
                                            <p>Hoa hồng: {(Number(group.vipLevel.commissionRate) * 100).toFixed(1)}%</p>
                                            <p>Tối đa: {group.vipLevel.maxOrders} đơn</p>
                                            <p>Sản phẩm giật đơn: {group._count.taskProducts || 0}</p>
                                        </div>
                                        <Button className="mt-4 w-full" onClick={() => handleSelectShopGroup(group)}>
                                            Chọn gian hàng
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Back button if shop group selected */}
            {selectedShopGroup && (
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedShopGroup(null)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    >
                        ← Quay lại chọn gian hàng
                    </button>
                </div>
            )}

            {/* Task Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {taskProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] active:scale-100 cursor-pointer" onClick={() => handleViewProduct(product)}>
                        <div className="relative">
                            {product.imageUrl ? (
                                <img
                                    src={normalizeImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className="w-full h-40 sm:h-48 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-product.png'
                                        e.currentTarget.onerror = null
                                    }}
                                />
                            ) : (
                                <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <span className="text-4xl sm:text-5xl md:text-6xl">🎁</span>
                                </div>
                            )}
                            {product.stock < 10 && product.stock > 0 && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                                    Còn {product.stock}
                                </div>
                            )}
                            {product.stock === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg sm:text-xl">Hết hàng</span>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-1">{product.name}</h3>
                            {product.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                                    {product.description}
                                </p>
                            )}
                            {product.vipLevel && (
                                <p className="text-xs text-purple-600 mb-2">VIP: {product.vipLevel.name}</p>
                            )}
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xl sm:text-2xl font-bold text-green-600">
                                    {product.basePrice.toLocaleString('vi-VN')}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">đ</span>
                            </div>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewProduct(product)
                                }}
                                disabled={product.stock === 0}
                                className="w-full text-sm sm:text-base"
                            >
                                {product.stock === 0 ? 'Hết hàng' : '🎯 Giật đơn ngay'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {taskProducts.length === 0 && selectedShopGroup && (
                <Card className="shadow-lg">
                    <CardContent className="py-12 sm:py-16 text-center text-gray-500">
                        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🏪</div>
                        <p className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Cửa hàng đang cập nhật</p>
                        <p className="text-xs sm:text-sm">Vui lòng quay lại sau</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}



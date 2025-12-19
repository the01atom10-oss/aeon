'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    stock: number
}

export default function ShopClient() {
    const { data: session } = useSession()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        loadProducts()
        loadBalance()
    }, [])

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products')
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products)
            }
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadBalance = async () => {
        try {
            const response = await fetch('/api/wallet')
            if (response.ok) {
                const data = await response.json()
                setBalance(data.balance || 0)
            }
        } catch (error) {
            console.error('Failed to load balance:', error)
        }
    }

    const handlePurchase = async (product: Product) => {
        if (balance < product.price) {
            alert('Không đủ Credits! Vui lòng nạp thêm.')
            return
        }

        if (!confirm(`Mua ${product.name} với giá ${product.price.toLocaleString()} Credits?`)) {
            return
        }

        setPurchasing(product.id)

        try {
            const response = await fetch('/api/products/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            })

            const data = await response.json()

            if (response.ok) {
                alert(`✅ Mua thành công ${product.name}!`)
                setBalance(data.newBalance)
                await loadProducts()
            } else {
                alert(`❌ ${data.error || 'Có lỗi xảy ra'}`)
            }
        } catch (error) {
            console.error('Failed to purchase:', error)
            alert('❌ Có lỗi xảy ra')
        } finally {
            setPurchasing(null)
        }
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {products.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] active:scale-100">
                        <div className="relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-40 sm:h-48 object-cover"
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
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xl sm:text-2xl font-bold text-green-600">
                                    {product.price.toLocaleString()}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">Credits</span>
                            </div>
                            <Button
                                onClick={() => handlePurchase(product)}
                                disabled={product.stock === 0 || purchasing === product.id || balance < product.price}
                                className="w-full text-sm sm:text-base"
                            >
                                {purchasing === product.id ? 'Đang mua...' :
                                 product.stock === 0 ? 'Hết hàng' :
                                 balance < product.price ? 'Không đủ Credits' :
                                 '🛒 Mua ngay'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {products.length === 0 && (
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



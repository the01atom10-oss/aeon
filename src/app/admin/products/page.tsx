'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { normalizeImageUrl } from '@/lib/image-utils'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    stock: number
    status: string
    sortOrder: number
    _count?: {
        purchases: number
    }
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '0',
        status: 'ACTIVE',
        sortOrder: '0'
    })

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/admin/products')
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct.id}`
                : '/api/admin/products'
            
            const method = editingProduct ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await loadProducts()
                setShowForm(false)
                setEditingProduct(null)
                resetForm()
            }
        } catch (error) {
            console.error('Failed to save product:', error)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            imageUrl: product.imageUrl || '',
            stock: product.stock.toString(),
            status: product.status,
            sortOrder: product.sortOrder.toString()
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
        
        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            })
            
            if (response.ok) {
                await loadProducts()
            }
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            stock: '0',
            status: 'ACTIVE',
            sortOrder: '0'
        })
    }

    if (loading) {
        return <div className="flex justify-center p-8">Đang tải...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
                    <p className="text-gray-600 mt-1">Quản lý sản phẩm cho người dùng mua</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingProduct(null)
                        resetForm()
                        setShowForm(!showForm)
                    }}
                >
                    {showForm ? 'Đóng' : '+ Thêm sản phẩm'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Tên sản phẩm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giá (Credits) *</label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mô tả</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Mô tả sản phẩm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ảnh URL</label>
                                    <Input
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                        placeholder="/images/product.jpg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Số lượng</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Thứ tự</label>
                                    <Input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="ACTIVE">Đang bán</option>
                                    <option value="INACTIVE">Tạm ngưng</option>
                                    <option value="OUT_OF_STOCK">Hết hàng</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingProduct(null)
                                        resetForm()
                                    }}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <Card key={product.id}>
                        <CardContent className="p-4">
                            {product.imageUrl && (
                                <img
                                    src={normalizeImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-product.png'
                                        e.currentTarget.onerror = null
                                    }}
                                />
                            )}
                            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                            {product.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {product.description}
                                </p>
                            )}
                            <div className="space-y-1 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giá:</span>
                                    <span className="font-semibold text-green-600">
                                        {product.price.toLocaleString()} Credits
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kho:</span>
                                    <span>{product.stock}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đã bán:</span>
                                    <span>{product._count?.purchases || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        product.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {product.status === 'ACTIVE' ? 'Đang bán' :
                                         product.status === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Tạm ngưng'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleEdit(product)}
                                    className="flex-1"
                                >
                                    Sửa
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-1"
                                >
                                    Xóa
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {products.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <div className="text-5xl mb-4">🛍️</div>
                        <p>Chưa có sản phẩm nào</p>
                        <p className="text-sm mt-2">Nhấn "Thêm sản phẩm" để tạo sản phẩm mới</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}



'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'

interface TaskProduct {
    id: string
    name: string
    description: string | null
    basePrice: number
    imageUrl: string | null
    isActive: boolean
    sortOrder: number
    createdAt: string
}

export default function AdminTaskProductsPage() {
    const [products, setProducts] = useState<TaskProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<TaskProduct | null>(null)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        imageUrl: '',
        isActive: true,
        sortOrder: '0'
    })

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/admin/task-products')
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn! Tối đa 5MB')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }))
                alert('✅ Upload ảnh thành công!')
            } else {
                alert('❌ ' + (data.error || 'Upload thất bại'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('❌ Có lỗi xảy ra khi upload')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const url = editingProduct
                ? `/api/admin/task-products/${editingProduct.id}`
                : '/api/admin/task-products'
            
            const method = editingProduct ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                await loadProducts()
                setShowForm(false)
                setEditingProduct(null)
                resetForm()
                alert('✅ Lưu thành công!')
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to save product:', error)
            alert('❌ Có lỗi xảy ra')
        }
    }

    const handleEdit = (product: TaskProduct) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || '',
            basePrice: Number(product.basePrice).toString(),
            imageUrl: product.imageUrl || '',
            isActive: product.isActive,
            sortOrder: product.sortOrder.toString()
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm giật đơn này?')) return
        
        try {
            const response = await fetch(`/api/admin/task-products/${id}`, {
                method: 'DELETE'
            })
            
            if (response.ok) {
                await loadProducts()
                alert('✅ Xóa thành công!')
            } else {
                alert('❌ Xóa thất bại')
            }
        } catch (error) {
            console.error('Failed to delete product:', error)
            alert('❌ Có lỗi xảy ra')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            basePrice: '',
            imageUrl: '',
            isActive: true,
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
                    <h1 className="text-3xl font-bold">Quản lý Sản phẩm Giật đơn</h1>
                    <p className="text-gray-600 mt-1">Sản phẩm cho chức năng "Giật đơn" - Nhiệm vụ</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingProduct(null)
                        resetForm()
                    }}
                    className="bg-primary-600"
                >
                    {showForm ? 'Đóng' : '+ Thêm sản phẩm'}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingProduct ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Tai nghe Logitech G502"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả chi tiết sản phẩm..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Giá ($) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    placeholder="220.00"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Số tiền user sẽ "đặt cọc" khi nhận đơn (sẽ được hoàn trả + hoa hồng)
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Ảnh sản phẩm</label>
                                
                                {formData.imageUrl && (
                                    <div className="mb-3 relative w-32 h-32">
                                        <Image
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary-50 file:text-primary-700
                                        hover:file:bg-primary-100
                                        disabled:opacity-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {uploading ? '⏳ Đang upload...' : 'Chọn ảnh (max 5MB)'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                                    <select
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Thứ tự hiển thị</label>
                                    <Input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-primary-600">
                                    💾 Lưu
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingProduct(null)
                                        resetForm()
                                    }}
                                    className="bg-gray-500"
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Products List */}
            <Card>
                <CardHeader>
                    <CardTitle>📦 Danh sách sản phẩm ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có sản phẩm nào. Thêm sản phẩm đầu tiên!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="border rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Image */}
                                    <div className="w-24 h-24 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {product.imageUrl ? (
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                📦
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleEdit(product)}
                                                    className="bg-blue-500 text-sm px-3 py-1"
                                                >
                                                    ✏️ Sửa
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="bg-red-500 text-sm px-3 py-1"
                                                >
                                                    🗑️ Xóa
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-center text-sm">
                                            <span className="font-semibold text-green-600">
                                                ${Number(product.basePrice).toFixed(2)}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                product.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                            <span className="text-gray-500">
                                                Thứ tự: {product.sortOrder}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


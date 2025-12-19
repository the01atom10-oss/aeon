'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface WheelPrize {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    prizeType: string
    value: number | null
    probability: number
    color: string | null
    isActive: boolean
    sortOrder: number
    stock: number
}

export default function WheelPrizesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [prizes, setPrizes] = useState<WheelPrize[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        prizeType: 'PRODUCT',
        value: '',
        probability: '0.1',
        color: '#4ECDC4',
        isActive: true,
        sortOrder: 0,
        stock: 1
    })
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/')
        } else {
            fetchPrizes()
        }
    }, [status, session, router])

    const fetchPrizes = async () => {
        try {
            const res = await fetch('/api/admin/wheel-prizes')
            const data = await res.json()
            setPrizes(data.prizes || [])
        } catch (error) {
            console.error('Error fetching prizes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingId 
                ? `/api/admin/wheel-prizes/${editingId}` 
                : '/api/admin/wheel-prizes'
            
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (res.ok) {
                alert(editingId ? 'Đã cập nhật!' : 'Đã tạo giải thưởng!')
                resetForm()
                fetchPrizes()
            } else {
                const error = await res.json()
                alert(`Lỗi: ${error.error}`)
            }
        } catch (error) {
            console.error('Error saving prize:', error)
            alert('Có lỗi xảy ra!')
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File ảnh không được vượt quá 5MB!')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)

            const res = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }))
                setImagePreview(data.url)
                alert('Upload ảnh thành công!')
            } else {
                alert('Lỗi upload ảnh: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Có lỗi xảy ra khi upload!')
        } finally {
            setUploading(false)
        }
    }

    const handleEdit = (prize: WheelPrize) => {
        setEditingId(prize.id)
        setFormData({
            name: prize.name,
            description: prize.description || '',
            imageUrl: prize.imageUrl || '',
            prizeType: prize.prizeType,
            value: prize.value?.toString() || '',
            probability: prize.probability.toString(),
            color: prize.color || '#4ECDC4',
            isActive: prize.isActive,
            sortOrder: prize.sortOrder,
            stock: prize.stock
        })
        setImagePreview(prize.imageUrl || null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa giải thưởng này?')) return
        
        try {
            const res = await fetch(`/api/admin/wheel-prizes/${id}`, {
                method: 'DELETE'
            })
            
            if (res.ok) {
                alert('Đã xóa!')
                fetchPrizes()
            }
        } catch (error) {
            console.error('Error deleting prize:', error)
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            name: '',
            description: '',
            imageUrl: '',
            prizeType: 'PRODUCT',
            value: '',
            probability: '0.1',
            color: '#4ECDC4',
            isActive: true,
            sortOrder: 0,
            stock: 1
        })
        setImagePreview(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Quản lý Vòng quay</h1>
                    <p className="text-white/60">Thêm và chỉnh sửa giải thưởng vòng quay</p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {editingId ? 'Chỉnh sửa giải thưởng' : 'Thêm giải thưởng mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 mb-2">Tên giải thưởng *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                placeholder="iPhone 15 Pro Max"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Hình ảnh</label>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                                />
                                {uploading && (
                                    <p className="text-sm text-yellow-400">Đang upload...</p>
                                )}
                                {imagePreview && (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => {
                                        setFormData({ ...formData, imageUrl: e.target.value })
                                        setImagePreview(e.target.value || null)
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                                    placeholder="Hoặc nhập URL hình ảnh"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Loại giải *</label>
                            <select
                                value={formData.prizeType}
                                onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                            >
                                <option value="PRODUCT">Sản phẩm</option>
                                <option value="CASH">Tiền mặt</option>
                                <option value="VOUCHER">Phiếu giảm giá</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Giá trị ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Xác suất (0.0 - 1.0) *</label>
                            <input
                                type="number"
                                step="0.0001"
                                required
                                value={formData.probability}
                                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                placeholder="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Màu</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full h-10 px-4 py-2 bg-white/5 border border-white/20 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Thứ tự hiển thị</label>
                            <input
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">Số lượng</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-white/80 mb-2">Mô tả</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                placeholder="Mô tả chi tiết về giải thưởng..."
                            />
                        </div>

                        <div className="col-span-2 flex items-center gap-4">
                            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5"
                                />
                                Kích hoạt
                            </label>
                        </div>

                        <div className="col-span-2 flex gap-3">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Hủy
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
                            >
                                {editingId ? 'Cập nhật' : 'Thêm giải thưởng'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Prizes List */}
                <div className="space-y-4">
                    {prizes.map((prize) => (
                        <div
                            key={prize.id}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                        >
                            <div className="flex gap-4">
                                {/* Prize Image */}
                                {prize.imageUrl ? (
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-white/5 border border-white/20 flex-shrink-0">
                                        <img
                                            src={prize.imageUrl.startsWith('http') 
                                                ? prize.imageUrl 
                                                : prize.imageUrl.startsWith('/') 
                                                    ? prize.imageUrl 
                                                    : `/${prize.imageUrl}`}
                                            alt={prize.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.png'
                                                e.currentTarget.onerror = null
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex-shrink-0 flex items-center justify-center text-4xl border border-white/20"
                                        style={{ backgroundColor: prize.color || '#4ECDC4' }}
                                    >
                                        🎁
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{prize.name}</h3>
                                            <div className="flex gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm ${
                                                    prize.isActive 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {prize.isActive ? 'Hoạt động' : 'Tắt'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400">
                                                    {prize.prizeType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {prize.value && (
                                                <p className="text-white font-semibold mb-1">
                                                    ${prize.value.toLocaleString()}
                                                </p>
                                            )}
                                            <p className="text-white/60 text-sm">
                                                Xác suất: {(prize.probability * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>

                                    {prize.description && (
                                        <p className="text-white/80 text-sm mb-3">{prize.description}</p>
                                    )}

                                    <div className="flex gap-4 text-sm text-white/60 mb-3">
                                        <span>Số lượng: {prize.stock}</span>
                                        <span>Thứ tự: {prize.sortOrder}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(prize)}
                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prize.id)}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {prizes.length === 0 && (
                    <div className="text-center text-white/60 py-12">
                        Chưa có giải thưởng nào
                    </div>
                )}
            </div>
        </div>
    )
}


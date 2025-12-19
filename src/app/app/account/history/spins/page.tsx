'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface WheelSpin {
    id: string
    prizeName: string
    prizeImage: string | null
    prizeType: string
    prizeValue: number | null
    prizeDescription: string | null
    shippingAddress: string | null
    shippingPhone: string | null
    shippingName: string | null
    shippingStatus: string
    createdAt: string
}

export default function SpinHistoryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [spins, setSpins] = useState<WheelSpin[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSpin, setSelectedSpin] = useState<WheelSpin | null>(null)
    const [shippingForm, setShippingForm] = useState({
        name: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user) {
            fetchSpinHistory()
        }
    }, [status, session, router])

    const fetchSpinHistory = async () => {
        try {
            const res = await fetch('/api/lucky-wheel/history')
            if (res.ok) {
                const data = await res.json()
                setSpins(data.spins || [])
            }
        } catch (error) {
            console.error('Error fetching spin history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSpin) return

        try {
            const res = await fetch(`/api/lucky-wheel/shipping/${selectedSpin.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shippingForm)
            })

            if (res.ok) {
                alert('Đã cập nhật địa chỉ nhận hàng!')
                setSelectedSpin(null)
                setShippingForm({ name: '', phone: '', address: '' })
                fetchSpinHistory()
            } else {
                const error = await res.json()
                alert(`Lỗi: ${error.error}`)
            }
        } catch (error) {
            console.error('Error submitting address:', error)
            alert('Có lỗi xảy ra!')
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ địa chỉ', color: 'bg-yellow-500/20 text-yellow-400' }
            case 'PROCESSING': return { label: 'Đang xử lý', color: 'bg-blue-500/20 text-blue-400' }
            case 'SHIPPED': return { label: 'Đã gửi', color: 'bg-purple-500/20 text-purple-400' }
            case 'DELIVERED': return { label: 'Đã nhận', color: 'bg-green-500/20 text-green-400' }
            default: return { label: status, color: 'bg-gray-500/20 text-gray-400' }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pb-24">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Lịch sử Vòng quay</h1>
                    <p className="text-white/60">Xem các giải thưởng đã nhận</p>
                </div>

                {/* Spin List */}
                <div className="space-y-4">
                    {spins.map((spin) => {
                        const statusInfo = getStatusLabel(spin.shippingStatus)
                        return (
                            <div
                                key={spin.id}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                            >
                                <div className="flex gap-4">
                                    {/* Prize Image */}
                                    {spin.prizeImage ? (
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/20">
                                            <img
                                                src={spin.prizeImage.startsWith('http') ? spin.prizeImage : spin.prizeImage.startsWith('/') ? spin.prizeImage : `/${spin.prizeImage}`}
                                                alt={spin.prizeName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.error('Image load error:', spin.prizeImage)
                                                    e.currentTarget.src = '/placeholder-product.png'
                                                    e.currentTarget.onerror = null
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-white/20 flex items-center justify-center text-4xl">
                                            🎁
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">
                                                    {spin.prizeName}
                                                </h3>
                                                {spin.prizeDescription && (
                                                    <p className="text-white/70 text-sm mb-2">
                                                        {spin.prizeDescription}
                                                    </p>
                                                )}
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
                                                        {spin.prizeType}
                                                    </span>
                                                </div>
                                            </div>
                                            {spin.prizeValue && (
                                                <div className="text-right">
                                                    <span className="text-white/60 text-sm">Giá trị:</span>
                                                    <p className="text-white font-semibold">
                                                        ${spin.prizeValue.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Shipping Info */}
                                        {spin.shippingAddress ? (
                                            <div className="bg-white/5 rounded-lg p-3 mb-3">
                                                <p className="text-white/80 text-sm mb-1">
                                                    <strong>Người nhận:</strong> {spin.shippingName}
                                                </p>
                                                <p className="text-white/80 text-sm mb-1">
                                                    <strong>SĐT:</strong> {spin.shippingPhone}
                                                </p>
                                                <p className="text-white/80 text-sm">
                                                    <strong>Địa chỉ:</strong> {spin.shippingAddress}
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedSpin(spin)}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all mb-3"
                                            >
                                                Nhập địa chỉ nhận hàng
                                            </button>
                                        )}

                                        {/* Timestamp */}
                                        <div className="text-xs text-white/60">
                                            {new Date(spin.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {spins.length === 0 && (
                    <div className="text-center text-white/60 py-12">
                        Chưa có lượt quay nào
                    </div>
                )}
            </div>

            {/* Shipping Form Modal */}
            {selectedSpin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">Nhập địa chỉ nhận hàng</h2>
                        
                        {/* Prize Image */}
                        {selectedSpin.prizeImage ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white/5 mb-4 border border-white/20">
                                <img
                                    src={selectedSpin.prizeImage.startsWith('http') ? selectedSpin.prizeImage : selectedSpin.prizeImage.startsWith('/') ? selectedSpin.prizeImage : `/${selectedSpin.prizeImage}`}
                                    alt={selectedSpin.prizeName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Image load error:', selectedSpin.prizeImage)
                                        e.currentTarget.src = '/placeholder-product.png'
                                        e.currentTarget.onerror = null
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-white/20 flex items-center justify-center text-6xl mb-4">
                                🎁
                            </div>
                        )}
                        
                        <p className="text-white/80 mb-2 text-lg font-semibold">Giải thưởng: {selectedSpin.prizeName}</p>
                        {selectedSpin.prizeDescription && (
                            <p className="text-white/60 mb-6 text-sm">{selectedSpin.prizeDescription}</p>
                        )}
                        
                        <form onSubmit={handleSubmitAddress} className="space-y-4">
                            <div>
                                <label className="block text-white/80 mb-2">Họ tên người nhận</label>
                                <input
                                    type="text"
                                    required
                                    value={shippingForm.name}
                                    onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    required
                                    value={shippingForm.phone}
                                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    placeholder="0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">Địa chỉ nhận hàng</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={shippingForm.address}
                                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    placeholder="Số nhà, đường, phường, quận, thành phố"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSpin(null)
                                        setShippingForm({ name: '', phone: '', address: '' })
                                    }}
                                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}


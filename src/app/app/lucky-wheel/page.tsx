'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LuckyWheel from '@/components/games/LuckyWheel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface WheelSpin {
    id: string
    prizeName: string
    prizeImage: string | null
    prizeType: string
    prizeValue: number | null
    shippingAddress: string | null
    shippingPhone: string | null
    shippingName: string | null
    shippingStatus: string
    createdAt: string
}

export default function LuckyWheelPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'wheel' | 'rewards'>('wheel')
    const [spins, setSpins] = useState<WheelSpin[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedSpin, setSelectedSpin] = useState<WheelSpin | null>(null)
    const [shippingForm, setShippingForm] = useState({
        name: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user && activeTab === 'rewards') {
            fetchSpinHistory()
        }
    }, [status, session, router, activeTab])

    const fetchSpinHistory = async () => {
        setLoading(true)
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
                alert('✅ Đã cập nhật địa chỉ nhận hàng!')
                setSelectedSpin(null)
                setShippingForm({ name: '', phone: '', address: '' })
                fetchSpinHistory()
            } else {
                const error = await res.json()
                alert(`❌ Lỗi: ${error.error}`)
            }
        } catch (error) {
            console.error('Error submitting address:', error)
            alert('❌ Có lỗi xảy ra!')
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

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-6 px-2 sm:px-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white text-center shadow-lg">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4 animate-bounce">🎰</div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                    Vòng Quay May Mắn
                </h1>
                <p className="text-yellow-100 text-sm sm:text-base md:text-lg">
                    Quay miễn phí với lượt quay bạn có - Trúng nhiều giải thưởng hấp dẫn!
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('wheel')}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                        activeTab === 'wheel'
                            ? 'border-b-2 border-yellow-500 text-yellow-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    🎰 Vòng Quay
                </button>
                <button
                    onClick={() => {
                        setActiveTab('rewards')
                        fetchSpinHistory()
                    }}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                        activeTab === 'rewards'
                            ? 'border-b-2 border-yellow-500 text-yellow-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    🎁 Phần Thưởng ({spins.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'wheel' ? (
                <Card className="shadow-lg">
                    <CardContent className="py-4 sm:py-6 md:py-8">
                        <LuckyWheel />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                            <p className="text-gray-600">Đang tải...</p>
                        </div>
                    ) : spins.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="text-6xl mb-4">🎁</div>
                                <p className="text-gray-600 text-lg">Chưa có phần thưởng nào</p>
                                <p className="text-gray-400 text-sm mt-2">Quay vòng quay để nhận phần thưởng!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {spins.map((spin) => {
                                const statusInfo = getStatusLabel(spin.shippingStatus)
                                return (
                                    <Card key={spin.id} className="shadow-md">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex gap-4">
                                                {/* Prize Image */}
                                                {spin.prizeImage ? (
                                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
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
                                                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl">
                                                        🎁
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                                                {spin.prizeName}
                                                            </h3>
                                                            <div className="flex gap-2 flex-wrap">
                                                                <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
                                                                    {statusInfo.label}
                                                                </span>
                                                                <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-600">
                                                                    {spin.prizeType}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {spin.prizeValue && (
                                                            <div className="text-right">
                                                                <span className="text-gray-500 text-sm">Giá trị:</span>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    ${spin.prizeValue.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Shipping Info */}
                                                    {spin.shippingAddress ? (
                                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                            <p className="text-sm text-gray-700 mb-1">
                                                                <strong>Người nhận:</strong> {spin.shippingName}
                                                            </p>
                                                            <p className="text-sm text-gray-700 mb-1">
                                                                <strong>SĐT:</strong> {spin.shippingPhone}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                <strong>Địa chỉ:</strong> {spin.shippingAddress}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelectedSpin(spin)}
                                                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold mb-3"
                                                        >
                                                            📝 Nhập địa chỉ nhận hàng
                                                        </button>
                                                    )}

                                                    {/* Timestamp */}
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(spin.createdAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Shipping Form Modal */}
            {selectedSpin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Nhập địa chỉ nhận hàng</h2>
                        {selectedSpin.prizeImage ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200">
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
                            <div className="w-full h-48 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-6xl mb-4">
                                🎁
                            </div>
                        )}
                        <p className="text-gray-600 mb-6">Giải thưởng: <strong>{selectedSpin.prizeName}</strong></p>
                        
                        <form onSubmit={handleSubmitAddress} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Họ tên người nhận *</label>
                                <input
                                    type="text"
                                    required
                                    value={shippingForm.name}
                                    onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    required
                                    value={shippingForm.phone}
                                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Địa chỉ nhận hàng *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={shippingForm.address}
                                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* How to Play - Only show on wheel tab */}
            {activeTab === 'wheel' && (
                <>
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">📋 Hướng dẫn chơi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 sm:space-y-3 text-gray-700">
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
                                    <p className="text-sm sm:text-base">Hoàn thành nhiệm vụ để nhận <strong className="text-green-600">lượt quay miễn phí</strong></p>
                                </div>
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
                                    <p className="text-sm sm:text-base">Nhấn nút <strong>"QUAY NGAY!"</strong> để bắt đầu</p>
                                </div>
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
                                    <p className="text-sm sm:text-base">Vòng quay sẽ dừng lại ở một phần thưởng ngẫu nhiên</p>
                                </div>
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">4</span>
                                    <p className="text-sm sm:text-base">Xem phần thưởng tại tab <strong>"🎁 Phần Thưởng"</strong> và nhập địa chỉ</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
                        <CardContent className="py-3 sm:py-4">
                            <p className="text-xs sm:text-sm text-green-800">
                                💡 <strong>Lưu ý:</strong> Vòng quay hoàn toàn miễn phí! 
                                Hoàn thành nhiệm vụ "Giật đơn" để nhận lượt quay. Mỗi đơn được duyệt = 1 lượt quay miễn phí!
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}


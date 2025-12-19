'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DepositPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'Chuyển khoản ngân hàng',
        note: '',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setLoading(true)

        try {
            const res = await fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    paymentMethod: formData.paymentMethod,
                    note: formData.note,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.' })
                setTimeout(() => {
                    router.push('/app/account/deposit-history')
                }, 2000)
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi. Vui lòng thử lại.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen text-white px-4 py-4 pb-24 space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/app/account/my" className="w-10 h-10 bg-gray-800/60 rounded-full flex items-center justify-center hover:bg-gray-700/60 transition-colors">
                    <span className="text-xl">←</span>
                </Link>
                <h1 className="text-2xl font-bold">Nạp tiền</h1>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-5 backdrop-blur-sm border border-white/10 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium shadow-lg ${
                                message.type === 'success'
                                    ? 'bg-green-600/30 text-green-200 border border-green-500/50'
                                    : 'bg-red-600/30 text-red-200 border border-red-500/50'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Số tiền ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">$</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-gray-700/50 rounded-xl pl-10 pr-4 py-4 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-semibold"
                                placeholder="0.00"
                                min="10"
                                step="0.01"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 ml-1">💡 Số tiền nạp tối thiểu: 10$</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Phương thức thanh toán</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-xl px-4 py-4 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        >
                            <option>Chuyển khoản ngân hàng</option>
                            <option>Ví điện tử</option>
                            <option>Thẻ tín dụng</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Thêm ghi chú..."
                            rows={3}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-2xl p-5 border border-blue-500/40 shadow-lg">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <span className="text-2xl">🏦</span>
                            Thông tin chuyển khoản
                        </h3>
                        <div className="space-y-2 text-sm bg-gray-900/40 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Ngân hàng:</span>
                                <span className="font-bold text-blue-300">Vietcombank</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Số tài khoản:</span>
                                <span className="font-bold text-blue-300 font-mono">1234567890</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Tên:</span>
                                <span className="font-bold text-blue-300">9CARAT GROUP</span>
                            </div>
                        </div>
                        <p className="text-xs text-cyan-200 mt-3 bg-cyan-600/20 rounded-lg p-2">
                            ⚠️ Vui lòng chuyển khoản đúng số tiền và ghi rõ tên đăng nhập trong nội dung
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl py-4 font-bold text-lg shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02]"
                    >
                        {loading ? '⏳ Đang gửi...' : '✅ Gửi yêu cầu nạp tiền'}
                    </button>
                </form>
            </div>
        </div>
    )
}


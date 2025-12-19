'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WithdrawPage() {
    const router = useRouter()
    const [balance, setBalance] = useState('0')
    const [formData, setFormData] = useState({
        amount: '',
        withdrawalPin: '',
        bankName: '',
        bankAccount: '',
        bankAccountName: '',
        note: '',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchBalance()
    }, [])

    const fetchBalance = async () => {
        try {
            const res = await fetch('/api/balance')
            const data = await res.json()
            if (data.success) {
                setBalance(data.data.balance)
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setLoading(true)

        try {
            const res = await fetch('/api/withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    withdrawalPin: formData.withdrawalPin,
                    bankName: formData.bankName,
                    bankAccount: formData.bankAccount,
                    bankAccountName: formData.bankAccountName,
                    note: formData.note,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin duyệt.' })
                setTimeout(() => {
                    router.push('/app/account/withdraw-history')
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
                <h1 className="text-2xl font-bold">Rút tiền</h1>
            </div>

            <div className="bg-gradient-to-r from-red-600/90 to-pink-600/90 rounded-2xl p-5 backdrop-blur-sm border border-white/20 shadow-xl">
                <p className="text-sm text-white/90 mb-1">Số dư khả dụng</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm text-white/70">$</span>
                    <p className="text-4xl font-bold">{parseFloat(balance).toFixed(2)}</p>
                </div>
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
                        <label className="block text-sm font-medium mb-2 text-gray-300">Số tiền ($) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">$</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-gray-700/50 rounded-xl pl-10 pr-4 py-4 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-lg font-semibold"
                                placeholder="0.00"
                                min="10"
                                max={balance}
                                step="0.01"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 ml-1">💡 Số tiền rút tối thiểu: 10$</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Mã rút vốn (Bảo mật) *</label>
                        <input
                            type="password"
                            value={formData.withdrawalPin}
                            onChange={(e) => setFormData({ ...formData, withdrawalPin: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-xl px-4 py-4 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                            placeholder="Nhập mã PIN 6 số"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-2 ml-1">🔒 Mã PIN bảo mật bạn đã đăng ký</p>
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Tên ngân hàng *</label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none"
                            placeholder="VD: Vietcombank, Techcombank..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Số tài khoản *</label>
                        <input
                            type="text"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none"
                            placeholder="Nhập số tài khoản"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Tên chủ tài khoản *</label>
                        <input
                            type="text"
                            value={formData.bankAccountName}
                            onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none"
                            placeholder="Nhập tên chủ tài khoản"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500 focus:outline-none"
                            placeholder="Thêm ghi chú..."
                            rows={2}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-2xl p-4 border border-yellow-500/40 shadow-lg">
                        <p className="text-sm text-yellow-200 font-medium">
                            ⚠️ Vui lòng kiểm tra kỹ thông tin ngân hàng. Tiền sẽ được chuyển trong vòng 24h sau khi được duyệt.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl py-4 font-bold text-lg shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02]"
                    >
                        {loading ? '⏳ Đang gửi...' : '💸 Gửi yêu cầu rút tiền'}
                    </button>
                </form>
            </div>
        </div>
    )
}


'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function QuickBalancePage() {
    const [userId, setUserId] = useState('')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleAddBalance = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch(`/api/admin/users/${userId}/balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: Number(amount),
                    note: 'Quick balance add'
                })
            })

            const data = await response.json()

            if (response.ok) {
                const action = Number(amount) > 0 ? 'Đã thêm' : 'Đã trừ'
                setMessage(`✅ ${action} ${Math.abs(Number(amount))} cho user. Balance mới: ${data.newBalance}`)
                setAmount('')
            } else {
                setMessage(`❌ ${data.error || 'Có lỗi xảy ra'}`)
            }
        } catch (error) {
            setMessage('❌ Lỗi kết nối')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>⚡ Quick Add Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddBalance} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">User ID</label>
                            <Input
                                required
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="clxxxxx..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Lấy từ /admin/users
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Số tiền (Credits/$)</label>
                            <Input
                                required
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="100 (dương = cộng, âm = trừ)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ví dụ: 100 (cộng) hoặc -50 (trừ)
                            </p>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Thêm Balance'}
                        </Button>
                    </form>

                    {message && (
                        <div className={`mt-4 p-3 rounded ${
                            message.startsWith('✅') 
                                ? 'bg-green-50 text-green-800' 
                                : 'bg-red-50 text-red-800'
                        }`}>
                            {message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>💡 Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>1. Lấy User ID:</strong></p>
                    <p className="pl-4">- Vào /admin/users</p>
                    <p className="pl-4">- Click vào user → copy ID từ URL</p>
                    
                    <p className="mt-3"><strong>2. Test vòng quay:</strong></p>
                    <p className="pl-4">- Add ít nhất $20 (phí quay)</p>
                    <p className="pl-4">- Login user → vào /app/lucky-wheel</p>
                    
                    <p className="mt-3"><strong>3. Test shop:</strong></p>
                    <p className="pl-4">- Add balance theo giá sản phẩm</p>
                    <p className="pl-4">- Vào /app/shop để mua</p>
                </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="py-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Lưu ý:</strong> Tool này để test nhanh. 
                        Production nên dùng qua /admin/users/[id] với audit log đầy đủ.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}



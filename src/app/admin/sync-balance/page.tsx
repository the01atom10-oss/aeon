'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SyncResult {
    userId: string
    username?: string
    oldBalance?: number
    newBalance?: number
    synced?: boolean
    error?: string
}

export default function SyncBalancePage() {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<SyncResult[]>([])
    const [summary, setSummary] = useState<{ total: number; synced: number } | null>(null)

    const handleSync = async () => {
        if (!confirm('Đồng bộ Wallet.balance → User.balance cho tất cả users?\n\nLưu ý: Thao tác này không thể hoàn tác!')) {
            return
        }

        setLoading(true)
        setResults([])
        setSummary(null)

        try {
            const response = await fetch('/api/admin/sync-balance', {
                method: 'POST'
            })

            const data = await response.json()

            if (response.ok) {
                setResults(data.results || [])
                setSummary({
                    total: data.total,
                    synced: data.synced
                })
            } else {
                alert(`Lỗi: ${data.error || 'Không thể sync'}`)
            }
        } catch (error) {
            alert('Lỗi kết nối')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>🔄 Đồng bộ Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Chức năng này làm gì?</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Copy <strong>Wallet.balance</strong> → <strong>User.balance</strong></li>
                            <li>• Áp dụng cho TẤT CẢ users</li>
                            <li>• Sau khi sync, mọi thứ dùng User.balance</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleSync}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? 'Đang đồng bộ...' : '🔄 Đồng bộ ngay'}
                    </Button>

                    {summary && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">✅ Hoàn thành!</h4>
                            <p className="text-sm text-green-800">
                                Đã đồng bộ <strong>{summary.synced}</strong> / {summary.total} users
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Kết quả chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded border ${
                                        result.synced
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    {result.synced ? (
                                        <div className="text-sm">
                                            <span className="font-semibold">{result.username}</span>
                                            <div className="text-gray-600 mt-1">
                                                Balance: {result.oldBalance} → <strong className="text-green-600">{result.newBalance}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-red-700">
                                            <strong>Error:</strong> {result.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">💡 Sau khi sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-blue-800">
                    <p><strong>Tất cả sẽ dùng User.balance:</strong></p>
                    <ul className="pl-4 space-y-1">
                        <li>✓ Lucky Wheel</li>
                        <li>✓ Shop</li>
                        <li>✓ Tasks/Missions</li>
                        <li>✓ Admin balance adjustment</li>
                        <li>✓ Wallet display</li>
                    </ul>
                    <p className="mt-3"><strong>Không cần lo lắng về:</strong></p>
                    <ul className="pl-4 space-y-1">
                        <li>✓ 2 balance khác nhau</li>
                        <li>✓ Balance không sync</li>
                        <li>✓ Confusion giữa Credits và $</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        support_email: '',
        support_phone: '',
        deposit_bank_name: '',
        deposit_bank_account: '',
        deposit_account_name: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings({ ...settings, ...data.settings })
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            })

            const data = await response.json()

            if (response.ok) {
                alert('✅ Cập nhật thành công!')
            } else {
                alert('❌ ' + (data.error || 'Có lỗi xảy ra'))
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('❌ Có lỗi xảy ra')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Cấu hình hệ thống</h1>
            </div>

            {/* Thông tin CSKH */}
            <Card>
                <CardHeader>
                    <CardTitle>📞 Thông tin Chăm sóc khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email hỗ trợ
                        </label>
                        <input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="support@9carat.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Số điện thoại hỗ trợ
                        </label>
                        <input
                            type="text"
                            value={settings.support_phone}
                            onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="1900-xxxx"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Thông tin nạp tiền */}
            <Card>
                <CardHeader>
                    <CardTitle>🏦 Thông tin tài khoản nhận tiền nạp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tên ngân hàng
                        </label>
                        <input
                            type="text"
                            value={settings.deposit_bank_name}
                            onChange={(e) => setSettings({ ...settings, deposit_bank_name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Vietcombank"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Số tài khoản
                        </label>
                        <input
                            type="text"
                            value={settings.deposit_bank_account}
                            onChange={(e) => setSettings({ ...settings, deposit_bank_account: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="0123456789"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tên chủ tài khoản
                        </label>
                        <input
                            type="text"
                            value={settings.deposit_account_name}
                            onChange={(e) => setSettings({ ...settings, deposit_account_name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="CONG TY AEON"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-blue-50">
                <CardHeader>
                    <CardTitle>👁️ Xem trước</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Thông tin hiển thị cho khách hàng:</h3>
                        <div className="space-y-2 text-sm">
                            <p>📧 Email: <strong>{settings.support_email || '(chưa cấu hình)'}</strong></p>
                            <p>📞 SĐT: <strong>{settings.support_phone || '(chưa cấu hình)'}</strong></p>
                            <hr className="my-2" />
                            <p>🏦 Ngân hàng: <strong>{settings.deposit_bank_name || '(chưa cấu hình)'}</strong></p>
                            <p>💳 STK: <strong>{settings.deposit_bank_account || '(chưa cấu hình)'}</strong></p>
                            <p>👤 Chủ TK: <strong>{settings.deposit_account_name || '(chưa cấu hình)'}</strong></p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end space-x-4">
                <Button
                    onClick={() => loadSettings()}
                    disabled={saving}
                    className="bg-gray-500 hover:bg-gray-600"
                >
                    ↻ Reset
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary-600 hover:bg-primary-700"
                >
                    {saving ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                </Button>
            </div>
        </div>
    )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface AuditLog {
    id: string
    action: string
    admin: {
        username: string
        email: string | null
    }
    targetUser: {
        username: string
        email: string | null
    } | null
    beforeBalance: string | null
    afterBalance: string | null
    note: string | null
    createdAt: string
}

export default function AuditLogsPage() {
    const { data: session } = useSession()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Kiểm tra xem user có phải admin Level 1 không
    const isAdminLevel1 = session?.user?.role === 'ADMIN' && (session.user as any)?.adminLevel === 'LEVEL_1'

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/audit-logs')
            const data = await res.json()
            if (data.success) {
                setLogs(data.data.logs)
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (logId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa audit log này? Thao tác này không thể hoàn tác.')) {
            return
        }

        setDeleting(logId)
        try {
            const res = await fetch(`/api/admin/audit-logs/${logId}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            if (res.ok && data.success) {
                alert('✅ Xóa audit log thành công!')
                fetchLogs() // Reload danh sách
            } else {
                alert('❌ ' + (data.error || data.message || 'Không thể xóa audit log'))
            }
        } catch (error) {
            console.error('Failed to delete audit log:', error)
            alert('❌ Đã xảy ra lỗi khi xóa audit log')
        } finally {
            setDeleting(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600 mt-1">Lịch sử thao tác của admin</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium">Time</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium">Admin</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium">Action</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium">Target User</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium">Balance Change</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium">Note</th>
                                    {isAdminLevel1 && (
                                        <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {log.admin.username}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {log.targetUser?.username || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {log.beforeBalance && log.afterBalance ? (
                                                <div>
                                                    <div className="text-gray-600">
                                                        {formatCurrency(log.beforeBalance)} →
                                                    </div>
                                                    <div className="font-semibold text-primary-600">
                                                        {formatCurrency(log.afterBalance)}
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {log.note || '-'}
                                        </td>
                                        {isAdminLevel1 && (
                                            <td className="py-3 px-4">
                                                <Button
                                                    onClick={() => handleDelete(log.id)}
                                                    disabled={deleting === log.id}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                                                >
                                                    {deleting === log.id ? 'Đang xóa...' : '🗑️ Xóa'}
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.length === 0 && (
                            <p className="text-center text-gray-600 py-8">
                                Chưa có audit log nào
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

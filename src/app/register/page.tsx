'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        withdrawalPin: '',
        inviteCode: '',
    })
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!data.success) {
                if (data.errors) {
                    const errorMap: Record<string, string> = {}
                    data.errors.forEach((err: any) => {
                        errorMap[err.path[0]] = err.message
                    })
                    setErrors(errorMap)
                } else {
                    setErrors({ general: data.message })
                }
            } else {
                router.push('/login?registered=true')
            }
        } catch (err) {
            setErrors({ general: 'Đã xảy ra lỗi. Vui lòng thử lại.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
            
            {/* Logo/Brand */}
            <div className="absolute top-6 left-0 right-0 text-center z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
                    9CARAT
                </h1>
            </div>

            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10 mt-20">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Đăng Ký
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Vui lòng điền đủ thông tin bên dưới
                    </p>
                </CardHeader>
                <CardContent className="pt-2">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {errors.general && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                                required
                            />
                            {errors.username && <p className="text-xs text-red-500 mt-1 ml-4">{errors.username}</p>}
                        </div>

                        <div>
                            <input
                                type="tel"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                                required
                            />
                            {errors.phone && <p className="text-xs text-red-500 mt-1 ml-4">{errors.phone}</p>}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                                required
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1 ml-4">{errors.password}</p>}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Mã rút vốn (Bảo mật)"
                                value={formData.withdrawalPin}
                                onChange={(e) =>
                                    setFormData({ ...formData, withdrawalPin: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                                required
                            />
                            {errors.withdrawalPin && <p className="text-xs text-red-500 mt-1 ml-4">{errors.withdrawalPin}</p>}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Mã mời hoặc Mã giới thiệu"
                                value={formData.inviteCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, inviteCode: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 px-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 accent-purple-600"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600">
                                Tôi đã đọc và đồng ý với thỏa thuận mở tài khoản
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !agreedToTerms}
                            className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Đã có tài khoản? </span>
                            <Link
                                href="/login"
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function ChatPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
                <div className="text-6xl mb-4">💬</div>
                <h1 className="text-4xl font-bold mb-2">
                    Trò chuyện trực tuyến
                </h1>
                <p className="text-blue-100 text-lg">
                    Liên hệ với đội ngũ hỗ trợ của chúng tôi
                </p>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>📱 Hỗ trợ trực tuyến 24/7</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Chào mừng bạn đến với dịch vụ hỗ trợ trực tuyến của AEON! 
                            Chúng tôi luôn sẵn sàng giúp đỡ bạn với bất kỳ câu hỏi hoặc vấn đề nào.
                        </p>
                        
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">Cách sử dụng:</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start">
                                    <span className="mr-2">🔵</span>
                                    <span>Nhấn vào biểu tượng chat ở góc phải dưới màn hình</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">🔵</span>
                                    <span>Gửi tin nhắn của bạn và đợi phản hồi từ đội ngũ hỗ trợ</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">🔵</span>
                                    <span>Tin nhắn sẽ được trả lời trong vòng vài phút</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="text-3xl mb-2">✅</div>
                                <h4 className="font-semibold text-green-900 mb-1">Hỗ trợ nhanh</h4>
                                <p className="text-sm text-green-700">
                                    Thời gian phản hồi trung bình dưới 5 phút
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <div className="text-3xl mb-2">🎯</div>
                                <h4 className="font-semibold text-purple-900 mb-1">Chuyên nghiệp</h4>
                                <p className="text-sm text-purple-700">
                                    Đội ngũ được đào tạo chuyên sâu
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
                <CardHeader>
                    <CardTitle>❓ Câu hỏi thường gặp</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Làm sao để nạp tiền?</h4>
                            <p className="text-sm text-gray-600">
                                Vào mục "Tài khoản" → "Nạp tiền" và làm theo hướng dẫn.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Tôi có thể rút tiền như thế nào?</h4>
                            <p className="text-sm text-gray-600">
                                Vào mục "Tài khoản" → "Rút tiền", điền thông tin ngân hàng và số tiền muốn rút.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Làm thế nào để tăng cấp VIP?</h4>
                            <p className="text-sm text-gray-600">
                                Hoàn thành nhiệm vụ để tích lũy số dư. Cấp VIP được tự động nâng cấp dựa trên số dư tài khoản.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Pointer */}
            <div className="fixed bottom-28 right-6 z-40 animate-bounce">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                    👇 Nhấn vào đây để chat!
                </div>
            </div>
        </div>
    )
}



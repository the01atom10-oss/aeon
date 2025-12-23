import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST - Bắt đầu giật đơn (match sản phẩm)
export async function POST(req: NextRequest) {
    try {
        console.log('🚀 [START TASK] Begin request')
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            console.log('❌ [START TASK] Unauthorized - no session')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        console.log('📝 [START TASK] Request body:', body)
        const { taskId, productId } = body

        if (!taskId) {
            console.log('❌ [START TASK] Missing taskId')
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            )
        }

        console.log(`🔍 [START TASK] Looking for task: ${taskId}`)

        // Get task and user info
        const [task, user] = await Promise.all([
            prisma.task.findUnique({
                where: { id: taskId },
                include: { vipLevel: true }
            }),
            prisma.user.findUnique({
                where: { id: session.user.id }
            })
        ])

        console.log('📋 [START TASK] Task found:', task ? `${task.name} (active: ${task.isActive})` : 'NULL')
        console.log('👤 [START TASK] User:', user ? `${user.username} (balance: ${user.balance})` : 'NULL')

        if (!task || !task.isActive) {
            console.log('❌ [START TASK] Task not found or inactive')
            return NextResponse.json(
                { error: 'Task not found or inactive' },
                { status: 404 }
            )
        }

        if (!user) {
            console.log('❌ [START TASK] User not found')
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get user's VIP level
        const userVipLevel = await prisma.vipLevel.findFirst({
            where: {
                minBalance: { lte: Number(user.balance) },
                isActive: true
            },
            orderBy: { minBalance: 'desc' }
        })

        // Check if user has required VIP level
        if (!userVipLevel || Number(userVipLevel.minBalance) < Number(task.vipLevel.minBalance)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Cần cấp VIP ${task.vipLevel.name} để thực hiện nhiệm vụ này` 
                },
                { status: 403 }
            )
        }

        // Match a product for this task (random from available products)
        console.log('🔍 [START TASK] Looking for active products...')
        console.log(`👤 [START TASK] User VIP Level ID: ${userVipLevel?.id || 'NONE'}`)
        console.log(`👤 [START TASK] User VIP Level Name: ${userVipLevel?.name || 'NONE'}`)
        
        let availableProducts: any[] = []

        // Nếu có productId từ request (user chọn sản phẩm cụ thể từ gian hàng)
        if (productId) {
            console.log(`🎯 [START TASK] User selected specific product: ${productId}`)
            const selectedProduct = await prisma.taskProduct.findUnique({
                where: { id: productId },
                include: { vipLevel: true }
            })

            if (!selectedProduct || !selectedProduct.isActive || selectedProduct.stock <= 0) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: 'Sản phẩm không khả dụng hoặc đã hết hàng.' 
                    },
                    { status: 404 }
                )
            }

            // Kiểm tra VIP level của sản phẩm có phù hợp với user không
            if (selectedProduct.vipLevelId && selectedProduct.vipLevelId !== userVipLevel?.id) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: `Sản phẩm này chỉ dành cho VIP ${selectedProduct.vipLevel?.name || 'khác'}.` 
                    },
                    { status: 403 }
                )
            }

            // Sử dụng sản phẩm đã chọn
            availableProducts = [selectedProduct]
        } else {
            // Lấy sản phẩm từ gian hàng tương ứng với VIP level của user
            if (userVipLevel) {
                // Tìm ShopGroup tương ứng với VIP level của user
                const shopGroup = await prisma.shopGroup.findFirst({
                    where: {
                        vipLevelId: userVipLevel.id,
                        isActive: true
                    },
                    include: {
                        taskProducts: {
                            where: {
                                taskProduct: {
                                    isActive: true,
                                    stock: { gt: 0 }
                                }
                            },
                            include: {
                                taskProduct: {
                                    include: {
                                        vipLevel: true
                                    }
                                }
                            },
                            orderBy: {
                                sortOrder: 'asc'
                            }
                        }
                    }
                })

                if (shopGroup && shopGroup.taskProducts.length > 0) {
                    // Lấy TaskProduct từ gian hàng
                    availableProducts = shopGroup.taskProducts.map(tp => tp.taskProduct)
                    console.log(`🏪 [START TASK] Found ${availableProducts.length} products in shop group: ${shopGroup.name}`)
                } else {
                    // KHÔNG fallback - chỉ lấy từ gian hàng
                    console.log(`❌ [START TASK] No shop group found for VIP level ${userVipLevel.name} or no products in shop group`)
                    console.log(`   - Shop group exists: ${shopGroup ? 'YES' : 'NO'}`)
                    if (shopGroup) {
                        console.log(`   - Products in shop group: ${shopGroup.taskProducts.length}`)
                    }
                    availableProducts = [] // Không có sản phẩm trong gian hàng
                }
            } else {
                // Nếu user chưa có VIP level, không cho phép nhận đơn
                console.log(`❌ [START TASK] User has no VIP level, cannot assign task`)
                availableProducts = []
            }
        }

        console.log(`📦 [START TASK] Found ${availableProducts.length} available products`)
        if (availableProducts.length > 0) {
            console.log(`📦 [START TASK] Available products:`)
            availableProducts.forEach((p, idx) => {
                const vipName = p.vipLevel?.name || p.vipLevelId || 'ALL'
                console.log(`   ${idx + 1}. ${p.name} - VIP: ${vipName}, Stock: ${p.stock}, Price: $${p.basePrice}`)
            })
        } else {
            console.log(`❌ [START TASK] No products available`)
            if (userVipLevel) {
                console.log(`   - User VIP Level: ${userVipLevel.name}`)
                console.log(`   - Looking in shop group for VIP level ${userVipLevel.name}`)
            }
            console.log(`   - Criteria: isActive: true, stock > 0`)
        }

        if (availableProducts.length === 0) {
            console.log('❌ [START TASK] No products available')
            let message = ''
            if (userVipLevel) {
                // Kiểm tra xem có gian hàng không
                const shopGroupCheck = await prisma.shopGroup.findFirst({
                    where: {
                        vipLevelId: userVipLevel.id,
                        isActive: true
                    }
                })
                if (!shopGroupCheck) {
                    message = `Gian hàng ${userVipLevel.name} chưa được tạo. Vui lòng liên hệ admin.`
                } else {
                    message = `Không có sản phẩm khả dụng trong gian hàng ${userVipLevel.name}. Vui lòng liên hệ admin để thêm sản phẩm vào gian hàng.`
                }
            } else {
                message = 'Bạn chưa có cấp VIP. Vui lòng nạp tiền để nâng cấp VIP level.'
            }
            return NextResponse.json(
                { 
                    success: false,
                    message
                },
                { status: 404 }
            )
        }

        // Random select a product
        const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
        console.log(`🎲 [START TASK] Selected product: ${randomProduct.name} ($${randomProduct.basePrice})`)

        // Calculate commission
        const assignedPrice = Number(randomProduct.basePrice)
        const commissionRate = Number(userVipLevel.commissionRate)
        const rewardAmount = assignedPrice * commissionRate
        const totalRefund = assignedPrice + rewardAmount

        // Create task run
        const taskRun = await prisma.taskRun.create({
            data: {
                userId: session.user.id,
                taskId: task.id,
                taskProductId: randomProduct.id,
                state: 'ASSIGNED', // Changed to ASSIGNED as product is already matched
                assignedPrice,
                commissionRate,
                rewardAmount,
                totalRefund,
                idempotencyKey: nanoid(),
                metadata: {
                    productName: randomProduct.name,
                    vipLevel: userVipLevel.name,
                    commissionRate: commissionRate
                }
            },
            include: {
                taskProduct: true
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                runId: taskRun.id,
                taskProduct: {
                    id: randomProduct.id,
                    name: randomProduct.name,
                    description: randomProduct.description,
                    price: Number(randomProduct.basePrice),
                    imageUrl: randomProduct.imageUrl
                },
                assignedPrice,
                commissionRate,
                rewardAmount,
                totalRefund
            },
            message: 'Đã tìm thấy đơn hàng!'
        })

    } catch (error: any) {
        console.error('❌ [START TASK] Error:', error)
        console.error('❌ [START TASK] Error message:', error?.message)
        console.error('❌ [START TASK] Error stack:', error?.stack)
        return NextResponse.json(
            { 
                success: false,
                error: error?.message || 'Failed to start task',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
        )
    }
}

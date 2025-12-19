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
        const { taskId } = body

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
        
        // Build where clause for products
        const productWhere: any = {
            isActive: true,
            stock: { gt: 0 } // Chỉ lấy sản phẩm còn hàng
        }

        // Filter by VIP level: null = tất cả, hoặc phù hợp với user VIP level
        if (userVipLevel) {
            productWhere.OR = [
                { vipLevelId: null }, // Sản phẩm cho tất cả
                { vipLevelId: userVipLevel.id } // Sản phẩm cho VIP level của user
            ]
        } else {
            // Nếu user chưa có VIP level, chỉ lấy sản phẩm cho tất cả
            productWhere.vipLevelId = null
        }

        const availableProducts = await prisma.taskProduct.findMany({
            where: productWhere,
            orderBy: { sortOrder: 'asc' }
        })

        console.log(`📦 [START TASK] Found ${availableProducts.length} available products`)
        if (availableProducts.length > 0) {
            console.log(`📦 [START TASK] Available products:`)
            availableProducts.forEach((p, idx) => {
                console.log(`   ${idx + 1}. ${p.name} - VIP: ${p.vipLevelId || 'ALL'}, Stock: ${p.stock}, Price: $${p.basePrice}`)
            })
        } else {
            console.log(`❌ [START TASK] No products match criteria:`)
            console.log(`   - isActive: true`)
            console.log(`   - stock > 0`)
            console.log(`   - vipLevelId: null OR ${userVipLevel?.id || 'NONE'}`)
        }

        if (availableProducts.length === 0) {
            console.log('❌ [START TASK] No products available')
            return NextResponse.json(
                { 
                    success: false,
                    message: 'Không có đơn hàng khả dụng. Vui lòng thử lại sau hoặc liên hệ admin.' 
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

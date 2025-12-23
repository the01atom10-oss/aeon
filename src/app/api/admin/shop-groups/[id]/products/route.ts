import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageProducts } from '@/lib/admin-permissions'

// GET - Lấy danh sách TaskProduct trong ShopGroup
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !canManageProducts(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shopGroupId = params.id

        // Lấy danh sách TaskProduct trong ShopGroup
        const shopGroup = await prisma.shopGroup.findUnique({
            where: { id: shopGroupId },
            include: {
                taskProducts: {
                    include: {
                        taskProduct: {
                            include: {
                                vipLevel: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            }
        })

        if (!shopGroup) {
            return NextResponse.json(
                { error: 'Shop group not found' },
                { status: 404 }
            )
        }

        // Lấy tất cả TaskProduct để có thể thêm vào
        const allTaskProducts = await prisma.taskProduct.findMany({
            where: { isActive: true },
            include: {
                vipLevel: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        // Đánh dấu sản phẩm nào đã có trong gian hàng
        const productIdsInGroup = new Set(
            shopGroup.taskProducts.map(tp => tp.taskProductId)
        )

        const formattedProducts = allTaskProducts.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            basePrice: Number(p.basePrice),
            vipLevel: p.vipLevel,
            isActive: p.isActive,
            stock: p.stock,
            isInGroup: productIdsInGroup.has(p.id)
        }))

        return NextResponse.json({
            success: true,
            data: {
                shopGroup: {
                    id: shopGroup.id,
                    name: shopGroup.name,
                    description: shopGroup.description
                },
                productsInGroup: shopGroup.taskProducts.map(tp => ({
                    id: tp.id,
                    taskProductId: tp.taskProductId,
                    sortOrder: tp.sortOrder,
                    taskProduct: {
                        ...tp.taskProduct,
                        basePrice: Number(tp.taskProduct.basePrice)
                    }
                })),
                allProducts: formattedProducts
            }
        })
    } catch (error) {
        console.error('Get shop group products error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Thêm TaskProduct vào ShopGroup
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !canManageProducts(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shopGroupId = params.id
        const body = await req.json()
        const { taskProductId, sortOrder } = body

        if (!taskProductId) {
            return NextResponse.json(
                { error: 'Task product ID is required' },
                { status: 400 }
            )
        }

        // Kiểm tra ShopGroup tồn tại
        const shopGroup = await prisma.shopGroup.findUnique({
            where: { id: shopGroupId }
        })

        if (!shopGroup) {
            return NextResponse.json(
                { error: 'Shop group not found' },
                { status: 404 }
            )
        }

        // Kiểm tra TaskProduct tồn tại
        const taskProduct = await prisma.taskProduct.findUnique({
            where: { id: taskProductId }
        })

        if (!taskProduct) {
            return NextResponse.json(
                { error: 'Task product not found' },
                { status: 404 }
            )
        }

        // Thêm vào ShopGroup (upsert để tránh duplicate)
        const shopGroupProduct = await prisma.shopGroupTaskProduct.upsert({
            where: {
                shopGroupId_taskProductId: {
                    shopGroupId,
                    taskProductId
                }
            },
            update: {
                sortOrder: sortOrder ?? 0
            },
            create: {
                shopGroupId,
                taskProductId,
                sortOrder: sortOrder ?? 0
            },
            include: {
                taskProduct: true
            }
        })

        return NextResponse.json({
            success: true,
            data: shopGroupProduct,
            message: 'Product added to shop group successfully'
        })
    } catch (error: any) {
        console.error('Add product to shop group error:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Xóa TaskProduct khỏi ShopGroup
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !canManageProducts(session.user)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shopGroupId = params.id
        const { searchParams } = new URL(req.url)
        const taskProductId = searchParams.get('taskProductId')

        if (!taskProductId) {
            return NextResponse.json(
                { error: 'Task product ID is required' },
                { status: 400 }
            )
        }

        // Xóa khỏi ShopGroup
        await prisma.shopGroupTaskProduct.delete({
            where: {
                shopGroupId_taskProductId: {
                    shopGroupId,
                    taskProductId
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Product removed from shop group successfully'
        })
    } catch (error: any) {
        console.error('Remove product from shop group error:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageProducts } from '@/lib/admin-permissions'

// Get single product (admin)
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                purchases: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// Update product (admin)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, description, price, imageUrl, stock, status, sortOrder } = await req.json()

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name,
                description,
                price: price !== undefined ? Number(price) : undefined,
                imageUrl,
                stock,
                status,
                sortOrder
            }
        })

        return NextResponse.json({ 
            success: true,
            product
        })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// Delete product (admin cấp 1 và cấp 2 đều có thể xóa sản phẩm)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || !canManageProducts(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.product.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ 
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}



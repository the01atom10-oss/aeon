import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy chi tiết sản phẩm
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const product = await prisma.taskProduct.findUnique({
            where: { id: params.id },
            include: {
                vipLevel: true,
                _count: {
                    select: { taskRuns: true }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ product })

    } catch (error) {
        console.error('Get task product error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// PUT - Cập nhật sản phẩm
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        console.log('Update body:', body)
        
        const { name, description, imageUrl, basePrice, sortOrder, isActive } = body

        const product = await prisma.taskProduct.update({
            where: { id: params.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description ? description.trim() : null }),
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
                ...(basePrice && { basePrice: parseFloat(basePrice) }),
                ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
                ...(isActive !== undefined && { isActive })
            }
        })

        return NextResponse.json({
            success: true,
            product: {
                ...product,
                basePrice: Number(product.basePrice)
            },
            message: 'Product updated successfully'
        })

    } catch (error: any) {
        console.error('Update task product error:', error)
        console.error('Error details:', error?.message, error?.code)
        return NextResponse.json(
            { error: error?.message || 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE - Xóa sản phẩm
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await prisma.taskProduct.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        })

    } catch (error) {
        console.error('Delete task product error:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}


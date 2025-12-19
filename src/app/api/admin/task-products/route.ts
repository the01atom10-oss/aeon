import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy danh sách sản phẩm giật đơn
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const products = await prisma.taskProduct.findMany({
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        // Convert Decimal to number for JSON serialization
        const formattedProducts = products.map(p => ({
            ...p,
            basePrice: Number(p.basePrice)
        }))

        return NextResponse.json({ products: formattedProducts })

    } catch (error) {
        console.error('Get task products error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST - Tạo sản phẩm giật đơn mới
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        console.log('Received body:', body)
        
        const { name, description, imageUrl, basePrice, isActive, sortOrder } = body

        if (!name || !basePrice) {
            return NextResponse.json(
                { error: 'Name and base price are required' },
                { status: 400 }
            )
        }

        const product = await prisma.taskProduct.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                imageUrl: imageUrl || null,
                basePrice: parseFloat(basePrice),
                isActive: isActive !== undefined ? isActive : true,
                sortOrder: sortOrder ? parseInt(sortOrder) : 0,
                stock: body.stock ? parseInt(body.stock) : 999999, // Default stock
                vipLevelId: body.vipLevelId || null // null = tất cả VIP levels
            }
        })

        return NextResponse.json({
            success: true,
            product: {
                ...product,
                basePrice: Number(product.basePrice)
            },
            message: 'Product created successfully'
        })

    } catch (error: any) {
        console.error('Create task product error:', error)
        console.error('Error details:', error?.message, error?.code)
        return NextResponse.json(
            { error: error?.message || 'Failed to create product' },
            { status: 500 }
        )
    }
}


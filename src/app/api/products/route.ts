import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get active products (for users)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const shopGroupId = searchParams.get('shopGroupId')

        const where: any = {
            status: 'ACTIVE'
        }

        if (shopGroupId) {
            where.shopGroupId = shopGroupId
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}



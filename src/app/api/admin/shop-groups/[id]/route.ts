import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageProducts } from '@/lib/admin-permissions'

export async function PUT(
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
        const { name, description, vipLevelId, isActive, sortOrder } = body

        if (!name || !vipLevelId) {
            return NextResponse.json(
                { error: 'Name and VIP level are required' },
                { status: 400 }
            )
        }

        const shopGroup = await prisma.shopGroup.update({
            where: { id: shopGroupId },
            data: {
                name,
                description,
                vipLevelId,
                isActive: isActive ?? true,
                sortOrder: sortOrder ?? 0
            },
            include: {
                vipLevel: true,
                taskProducts: {
                    include: {
                        taskProduct: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                basePrice: true,
                                isActive: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        products: true,
                        taskProducts: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: shopGroup
        })
    } catch (error: any) {
        console.error('Update shop group error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Shop group not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        // Check if shop group has products
        const shopGroup = await prisma.shopGroup.findUnique({
            where: { id: shopGroupId },
            include: {
                _count: {
                    select: {
                        taskProducts: true
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

        if (shopGroup._count.taskProducts > 0) {
            return NextResponse.json(
                { error: 'Cannot delete shop group with products. Please remove all products first.' },
                { status: 400 }
            )
        }

        await prisma.shopGroup.delete({
            where: { id: shopGroupId }
        })

        return NextResponse.json({
            success: true,
            message: 'Shop group deleted successfully'
        })
    } catch (error: any) {
        console.error('Delete shop group error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Shop group not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


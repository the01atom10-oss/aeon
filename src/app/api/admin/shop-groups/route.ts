import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const shopGroups = await prisma.shopGroup.findMany({
            include: {
                vipLevel: {
                    select: {
                        id: true,
                        name: true,
                        commissionRate: true,
                        maxOrders: true,
                        autoApproveLimit: true
                    }
                },
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
                    },
                    orderBy: {
                        sortOrder: 'asc'
                    }
                },
                _count: {
                    select: {
                        products: true,
                        taskProducts: true
                    }
                }
            },
            orderBy: {
                sortOrder: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            data: shopGroups
        })
    } catch (error) {
        console.error('Get shop groups error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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
        const { name, description, vipLevelId, isActive, sortOrder } = body

        if (!name || !vipLevelId) {
            return NextResponse.json(
                { error: 'Name and VIP level are required' },
                { status: 400 }
            )
        }

        const shopGroup = await prisma.shopGroup.create({
            data: {
                name,
                description,
                vipLevelId,
                isActive: isActive ?? true,
                sortOrder: sortOrder ?? 0
            },
            include: {
                vipLevel: true
            }
        })

        return NextResponse.json({
            success: true,
            data: shopGroup
        })
    } catch (error) {
        console.error('Create shop group error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        // Lấy VIP level của user dựa trên balance
        let userVipLevelId: string | null = null
        if (session?.user) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { balance: true }
            })
            
            if (user) {
                const balance = Number(user.balance)
                const vipLevel = await prisma.vipLevel.findFirst({
                    where: {
                        minBalance: { lte: balance },
                        isActive: true
                    },
                    orderBy: { minBalance: 'desc' }
                })
                userVipLevelId = vipLevel?.id || null
            }
        }

        const shopGroups = await prisma.shopGroup.findMany({
            where: {
                isActive: true
            },
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
                    where: {
                        taskProduct: {
                            isActive: true,
                            // Chỉ hiển thị sản phẩm phù hợp với VIP level của user
                            OR: [
                                { vipLevelId: userVipLevelId }, // Sản phẩm dành cho VIP level của user
                                { vipLevelId: null } // Sản phẩm dành cho tất cả
                            ]
                        }
                    },
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


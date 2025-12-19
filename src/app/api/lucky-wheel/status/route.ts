import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user freeSpins
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { 
                freeSpins: true,
                balance: true 
            }
        })

        // Count spins today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const spinsToday = await prisma.luckyWheelSpin.count({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: today
                }
            }
        })

        // Get active prizes (không filter theo stock để hiển thị đầy đủ)
        const prizes = await prisma.wheelPrize.findMany({
            where: { 
                isActive: true
                // stock: { gt: 0 } // Bỏ filter này để quà vẫn hiển thị dù stock = 0
            },
            orderBy: { sortOrder: 'asc' }
        })

        return NextResponse.json({
            freeSpins: user?.freeSpins || 0,
            balance: user?.balance ? Number(user.balance) : 0,
            spinsToday,
            prizes: prizes.map(p => ({
                id: p.id,
                name: p.name,
                imageUrl: p.imageUrl,
                prizeType: p.prizeType,
                value: p.value ? Number(p.value) : null,
                color: p.color,
                probability: Number(p.probability)
            }))
        })
    } catch (error) {
        console.error('Error fetching lucky wheel status:', error)
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        )
    }
}


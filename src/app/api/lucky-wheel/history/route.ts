import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const spins = await prisma.luckyWheelSpin.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                wheelPrize: {
                    select: {
                        description: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Format for JSON
        const formattedSpins = spins.map(spin => ({
            ...spin,
            prizeValue: spin.prizeValue ? Number(spin.prizeValue) : null,
            prizeDescription: spin.wheelPrize?.description || null
        }))

        return NextResponse.json({ spins: formattedSpins })
    } catch (error) {
        console.error('Error fetching spin history:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


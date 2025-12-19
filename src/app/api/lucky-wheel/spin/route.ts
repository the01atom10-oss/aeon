import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface WheelPrizeData {
    id: string
    name: string
    imageUrl: string | null
    prizeType: string
    value: number | null
    probability: number
}

function selectPrize(prizes: WheelPrizeData[]): WheelPrizeData {
    const random = Math.random()
    let cumulativeProbability = 0
    
    for (const prize of prizes) {
        cumulativeProbability += prize.probability
        if (random <= cumulativeProbability) {
            return prize
        }
    }
    
    return prizes[prizes.length - 1]
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                freeSpins: true,
                balance: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user has free spins
        if (user.freeSpins <= 0) {
            return NextResponse.json(
                { error: 'Bạn không còn lượt quay miễn phí' },
                { status: 400 }
            )
        }

        // Get active prizes (không filter theo stock để có thể quay được tất cả quà)
        const activePrizes = await prisma.wheelPrize.findMany({
            where: {
                isActive: true
                // stock: { gt: 0 } // Bỏ filter này để quà vẫn có thể quay được dù stock = 0
            },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                prizeType: true,
                value: true,
                probability: true
            }
        })

        if (activePrizes.length === 0) {
            return NextResponse.json(
                { error: 'Không có giải thưởng khả dụng' },
                { status: 400 }
            )
        }

        // Format prizes for selection
        const prizesData: WheelPrizeData[] = activePrizes.map(p => ({
            id: p.id,
            name: p.name,
            imageUrl: p.imageUrl,
            prizeType: p.prizeType,
            value: p.value ? Number(p.value) : null,
            probability: Number(p.probability)
        }))

        // Store description for later use
        const prizeDescriptions: Record<string, string | null> = {}
        activePrizes.forEach(p => {
            prizeDescriptions[p.id] = p.description
        })

        // Select a prize randomly
        const wonPrize = selectPrize(prizesData)

        // Record spin in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct free spin
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: { 
                    freeSpins: { decrement: 1 }
                }
            })

            // NOTE: Không giảm stock để quà vẫn hiển thị đầy đủ trong danh sách
            // Stock chỉ để admin quản lý, không ảnh hưởng đến việc quay
            // await tx.wheelPrize.update({
            //     where: { id: wonPrize.id },
            //     data: {
            //         stock: { decrement: 1 }
            //     }
            // })

            // Record the spin
            const spin = await tx.luckyWheelSpin.create({
                data: {
                    userId: session.user.id,
                    wheelPrizeId: wonPrize.id,
                    prizeName: wonPrize.name,
                    prizeImage: wonPrize.imageUrl,
                    prizeType: wonPrize.prizeType,
                    prizeValue: wonPrize.value,
                    isFreeSpin: true
                }
            })

            return { updatedUser, spin }
        })

        return NextResponse.json({
            success: true,
            prizeId: wonPrize.id,
            prizeName: wonPrize.name,
            prizeImage: wonPrize.imageUrl,
            prizeDescription: prizeDescriptions[wonPrize.id] || null,
            prizeType: wonPrize.prizeType,
            prizeValue: wonPrize.value,
            freeSpins: result.updatedUser.freeSpins,
            spinId: result.spin.id
        })
    } catch (error) {
        console.error('Error spinning lucky wheel:', error)
        return NextResponse.json(
            { error: 'Failed to spin' },
            { status: 500 }
        )
    }
}


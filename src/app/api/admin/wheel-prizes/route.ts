import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy danh sách sản phẩm vòng quay
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const prizes = await prisma.wheelPrize.findMany({
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        // Format for response
        const formattedPrizes = prizes.map(prize => ({
            ...prize,
            value: prize.value ? Number(prize.value) : null,
            probability: Number(prize.probability)
        }))

        return NextResponse.json({ prizes: formattedPrizes })
    } catch (error) {
        console.error('Error fetching wheel prizes:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Tạo sản phẩm vòng quay mới
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const {
            name,
            description,
            imageUrl,
            prizeType,
            value,
            probability,
            color,
            isActive,
            sortOrder,
            stock
        } = body

        if (!name || probability === undefined) {
            return NextResponse.json(
                { error: 'name and probability are required' },
                { status: 400 }
            )
        }

        const prize = await prisma.wheelPrize.create({
            data: {
                name,
                description,
                imageUrl,
                prizeType: prizeType || 'PRODUCT',
                value: value ? parseFloat(value) : null,
                probability: parseFloat(probability),
                color,
                isActive: isActive !== undefined ? isActive : true,
                sortOrder: sortOrder || 0,
                stock: stock || 999999
            }
        })

        return NextResponse.json({
            ...prize,
            value: prize.value ? Number(prize.value) : null,
            probability: Number(prize.probability)
        })
    } catch (error) {
        console.error('Error creating wheel prize:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


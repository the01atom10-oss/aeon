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
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const prize = await prisma.wheelPrize.findUnique({
            where: { id: params.id }
        })

        if (!prize) {
            return NextResponse.json(
                { error: 'Prize not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...prize,
            value: prize.value ? Number(prize.value) : null,
            probability: Number(prize.probability)
        })
    } catch (error) {
        console.error('Error fetching wheel prize:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
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

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl
        if (prizeType !== undefined) updateData.prizeType = prizeType
        if (value !== undefined) updateData.value = value ? parseFloat(value) : null
        if (probability !== undefined) updateData.probability = parseFloat(probability)
        if (color !== undefined) updateData.color = color
        if (isActive !== undefined) updateData.isActive = isActive
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder
        if (stock !== undefined) updateData.stock = stock

        const prize = await prisma.wheelPrize.update({
            where: { id: params.id },
            data: updateData
        })

        return NextResponse.json({
            ...prize,
            value: prize.value ? Number(prize.value) : null,
            probability: Number(prize.probability)
        })
    } catch (error) {
        console.error('Error updating wheel prize:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
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
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await prisma.wheelPrize.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting wheel prize:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { name, phone, address } = body

        if (!name || !phone || !address) {
            return NextResponse.json(
                { error: 'name, phone, and address are required' },
                { status: 400 }
            )
        }

        // Verify spin belongs to user
        const spin = await prisma.luckyWheelSpin.findUnique({
            where: { id: params.id }
        })

        if (!spin || spin.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Spin not found' },
                { status: 404 }
            )
        }

        // Update shipping info
        const updatedSpin = await prisma.luckyWheelSpin.update({
            where: { id: params.id },
            data: {
                shippingName: name,
                shippingPhone: phone,
                shippingAddress: address,
                shippingStatus: 'PROCESSING'
            }
        })

        return NextResponse.json({
            success: true,
            spin: {
                ...updatedSpin,
                prizeValue: updatedSpin.prizeValue ? Number(updatedSpin.prizeValue) : null
            }
        })
    } catch (error) {
        console.error('Error updating shipping info:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


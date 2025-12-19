import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId, quantity } = await req.json()

        if (!productId || !quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Invalid product or quantity' },
                { status: 400 }
            )
        }

        // Get product and user
        const [product, user] = await Promise.all([
            prisma.product.findUnique({ where: { id: productId } }),
            prisma.user.findUnique({ where: { id: session.user.id } })
        ])

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (product.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Product is not available' },
                { status: 400 }
            )
        }

        if (product.stock < quantity) {
            return NextResponse.json(
                { error: 'Not enough stock' },
                { status: 400 }
            )
        }

        const totalAmount = Number(product.price) * quantity
        const currentBalance = Number(user.balance)

        if (currentBalance < totalAmount) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            )
        }

        // Create purchase and update balance in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create purchase
            const purchase = await tx.productPurchase.create({
                data: {
                    userId: session.user.id,
                    productId,
                    quantity,
                    price: product.price,
                    totalAmount,
                    status: 'COMPLETED'
                }
            })

            // Update user balance
            const newBalance = currentBalance - totalAmount
            await tx.user.update({
                where: { id: session.user.id },
                data: { balance: newBalance }
            })

            // Update product stock
            await tx.product.update({
                where: { id: productId },
                data: { 
                    stock: { decrement: quantity }
                }
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    type: 'DEBIT',
                    amount: -totalAmount,
                    description: `Mua ${product.name} x${quantity}`,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    idempotencyKey: `purchase-${purchase.id}`
                }
            })

            return { purchase, newBalance }
        })

        return NextResponse.json({
            success: true,
            purchase: result.purchase,
            newBalance: result.newBalance
        })
    } catch (error) {
        console.error('Error purchasing product:', error)
        return NextResponse.json(
            { error: 'Failed to purchase product' },
            { status: 500 }
        )
    }
}



import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy danh sách thông báo (có search)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}
        
        if (search) {
            where.OR = [
                { user: { username: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { title: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.notification.count({ where })
        ])

        return NextResponse.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Tạo thông báo mới cho user
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { userId, title, message, type } = body

        if (!title || !message) {
            return NextResponse.json(
                { error: 'title and message are required' },
                { status: 400 }
            )
        }

        // If userId is empty or null, create broadcast notification
        // Otherwise, verify user exists
        if (userId && userId.trim() !== '') {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }
        }

        const notificationData: any = {
            title,
            message,
            type: type || 'INFO',
            createdBy: session.user.id
        }

        // Only set userId if provided, otherwise null for broadcast
        if (userId && userId.trim() !== '') {
            notificationData.userId = userId
        } else {
            notificationData.userId = null // Broadcast to all
        }

        const notification = await prisma.notification.create({
            data: notificationData,
            include: userId && userId.trim() !== '' ? {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            } : undefined
        })

        return NextResponse.json(notification)
    } catch (error) {
        console.error('Error creating notification:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


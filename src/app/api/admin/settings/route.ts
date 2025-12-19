import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lấy tất cả settings
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const settings = await prisma.systemSettings.findMany({
            orderBy: { key: 'asc' }
        })

        // Convert to key-value object
        const settingsObj: Record<string, string> = {}
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value
        })

        return NextResponse.json({ settings: settingsObj })

    } catch (error) {
        console.error('Get settings error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// POST - Cập nhật settings
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
        const { settings } = body

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json(
                { error: 'Invalid settings data' },
                { status: 400 }
            )
        }

        // Upsert each setting
        const updatePromises = Object.entries(settings).map(([key, value]) => {
            return prisma.systemSettings.upsert({
                where: { key },
                update: {
                    value: String(value),
                    updatedBy: session.user.id
                },
                create: {
                    key,
                    value: String(value),
                    updatedBy: session.user.id
                }
            })
        })

        await Promise.all(updatePromises)

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        })

    } catch (error) {
        console.error('Update settings error:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lấy settings công khai (không cần auth)
export async function GET(req: NextRequest) {
    try {
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: [
                        'support_email',
                        'support_phone',
                        'deposit_bank_name',
                        'deposit_bank_account',
                        'deposit_account_name'
                    ]
                }
            }
        })

        // Convert to key-value object
        const settingsObj: Record<string, string> = {}
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value
        })

        // Default values if not set
        return NextResponse.json({
            settings: {
                support_email: settingsObj.support_email || 'support@9carat.com',
                support_phone: settingsObj.support_phone || '1900-xxxx',
                deposit_bank_name: settingsObj.deposit_bank_name || 'Vietcombank',
                deposit_bank_account: settingsObj.deposit_bank_account || '0123456789',
                deposit_account_name: settingsObj.deposit_account_name || 'CONG TY 9CARAT'
            }
        })

    } catch (error) {
        console.error('Get public settings error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}


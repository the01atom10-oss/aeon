/**
 * Script to update existing users' invite codes to 7-character format
 */

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function generateUniqueInviteCode(): Promise<string> {
    let inviteCode: string = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
        // Generate 7-character random code (uppercase letters and numbers)
        inviteCode = nanoid(7).toUpperCase()
        
        // Check if code already exists
        const existing = await prisma.user.findFirst({
            where: { inviteCode },
        })

        if (!existing) {
            isUnique = true
        } else {
            attempts++
        }
    }

    if (!isUnique) {
        // Fallback: generate 7-digit numeric code if all attempts fail
        inviteCode = Math.floor(1000000 + Math.random() * 9000000).toString()
    }

    return inviteCode
}

async function updateInviteCodes() {
    console.log('🔄 Starting invite code update...')

    // Get all users without invite codes or with old format
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { inviteCode: null },
                { inviteCode: '' },
            ]
        }
    })

    console.log(`📊 Found ${users.length} users to update`)

    let updated = 0
    let errors = 0

    for (const user of users) {
        try {
            const newInviteCode = await generateUniqueInviteCode()
            
            await prisma.user.update({
                where: { id: user.id },
                data: { inviteCode: newInviteCode }
            })

            console.log(`✅ Updated user ${user.username} with code: ${newInviteCode}`)
            updated++
        } catch (error) {
            console.error(`❌ Failed to update user ${user.username}:`, error)
            errors++
        }
    }

    // Also update users with invite codes longer than 7 characters
    const usersWithLongCodes = await prisma.user.findMany({
        where: {
            inviteCode: {
                not: null
            }
        }
    })

    console.log(`\n📊 Checking ${usersWithLongCodes.length} existing codes...`)

    for (const user of usersWithLongCodes) {
        if (user.inviteCode && user.inviteCode.length > 7) {
            try {
                const newInviteCode = await generateUniqueInviteCode()
                
                await prisma.user.update({
                    where: { id: user.id },
                    data: { inviteCode: newInviteCode }
                })

                console.log(`✅ Shortened code for ${user.username}: ${user.inviteCode} → ${newInviteCode}`)
                updated++
            } catch (error) {
                console.error(`❌ Failed to shorten code for ${user.username}:`, error)
                errors++
            }
        }
    }

    console.log('\n✨ Update complete!')
    console.log(`✅ Successfully updated: ${updated}`)
    console.log(`❌ Errors: ${errors}`)
}

updateInviteCodes()
    .catch((error) => {
        console.error('💥 Script failed:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


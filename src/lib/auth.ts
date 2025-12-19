import type { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username/Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('Missing credentials')
                }

                // Find user by username or email
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials.username },
                            { email: credentials.username },
                        ],
                    },
                })

                if (!user) {
                    throw new Error('Invalid username or password')
                }

                // Check if user is active
                if (user.status !== 'ACTIVE') {
                    throw new Error('Account is suspended or banned')
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                )

                if (!isValidPassword) {
                    throw new Error('Invalid username or password')
                }

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                } as NextAuthUser
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = (user as any).username
                token.role = (user as any).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
                (session.user as any).role = token.role;
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}

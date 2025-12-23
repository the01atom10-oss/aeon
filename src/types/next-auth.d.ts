import { UserRole, AdminLevel } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
    interface User {
        id: string
        username: string
        email: string | null
        role: UserRole
        adminLevel?: AdminLevel | null
    }

    interface Session {
        user: {
            id: string
            username: string
            email: string | null
            role: UserRole
            adminLevel?: AdminLevel | null
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username: string
        role: UserRole
        adminLevel?: AdminLevel | null
    }
}

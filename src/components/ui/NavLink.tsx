'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
    href: string
    children: React.ReactNode
    icon?: React.ReactNode
}

export function NavLink({ href, children, icon }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
            )}
        >
            {icon}
            {children}
        </Link>
    )
}

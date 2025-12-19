import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                {
                    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500':
                        variant === 'primary',
                    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500':
                        variant === 'secondary',
                    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
                        variant === 'danger',
                    'bg-transparent hover:bg-gray-100 focus:ring-gray-500':
                        variant === 'ghost',
                    'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500':
                        variant === 'outline',
                    'px-3 py-1.5 text-sm': size === 'sm',
                    'px-4 py-2 text-base': size === 'md',
                    'px-6 py-3 text-lg': size === 'lg',
                },
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

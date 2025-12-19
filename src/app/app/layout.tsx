import { AppLayout } from '@/components/layout/AppLayout'

export default function UserAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppLayout>{children}</AppLayout>
}

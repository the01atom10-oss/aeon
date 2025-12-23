/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    // Chạy bình thường, không dùng standalone mode
    // output: 'standalone', // Đã tắt để chạy bình thường
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'cwqlafntqzwiqydxgust.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        unoptimized: true, // Disable optimization for local images
    },
}

module.exports = nextConfig

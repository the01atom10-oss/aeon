/**
 * Helper functions để xử lý URL ảnh
 */

/**
 * Normalize image URL để đảm bảo hiển thị đúng trên VPS
 * @param imageUrl URL ảnh từ database
 * @returns URL đã được normalize
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
        return '/placeholder-product.png'
    }

    // Nếu đã là absolute URL (http/https), trả về nguyên
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
    }

    // Nếu bắt đầu bằng /, trả về nguyên (relative path)
    if (imageUrl.startsWith('/')) {
        return imageUrl
    }

    // Nếu không có / ở đầu, thêm vào
    return `/${imageUrl}`
}

/**
 * Lấy base URL từ environment variables
 */
export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // Client-side: dùng window.location
        return window.location.origin
    }
    
    // Server-side: dùng environment variables
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || ''
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

/**
 * Tạo absolute URL cho ảnh
 * @param imageUrl URL ảnh (có thể là relative hoặc absolute)
 * @returns Absolute URL hoặc relative path
 */
export function getAbsoluteImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
        return '/placeholder-product.png'
    }

    // Nếu đã là absolute URL, trả về nguyên
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
    }

    // Normalize path - đảm bảo bắt đầu bằng /
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
    
    // Ở client-side, có thể dùng relative path trực tiếp (Next.js sẽ tự resolve)
    // Hoặc tạo absolute URL nếu cần
    if (typeof window !== 'undefined') {
        // Client-side: có thể dùng relative path hoặc absolute
        // Thử dùng relative path trước (Next.js tự serve)
        return normalizedPath
    }
    
    // Server-side: tạo absolute URL nếu có baseUrl
    const baseUrl = getBaseUrl()
    return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}


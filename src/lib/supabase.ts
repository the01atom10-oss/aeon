import { createClient } from '@supabase/supabase-js'

// Lấy credentials từ environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
// Service role key cho server-side (nếu có, sẽ dùng thay vì anon key)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Ưu tiên dùng service_role key nếu có (an toàn hơn cho server-side)
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env')
}

// Tạo Supabase client
// Nếu có service_role key, dùng nó (bypass RLS)
// Nếu không, dùng anon key (cần policies cho public)
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false, // Không persist session cho server-side
        autoRefreshToken: false,
    },
})

// Helper function để upload file lên Supabase Storage
export async function uploadImageToSupabase(
    file: File,
    filename: string,
    bucket: string = 'products'
): Promise<{ url: string; path: string } | null> {
    try {
        // Kiểm tra credentials
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Supabase credentials chưa được cấu hình!')
            console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'MISSING')
            console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
            return null
        }

        console.log('🚀 Bắt đầu upload lên Supabase...')
        console.log('   Bucket:', bucket)
        console.log('   Filename:', filename)
        console.log('   File size:', file.size, 'bytes')
        console.log('   File type:', file.type)

        // Convert File to ArrayBuffer rồi sang Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log('📤 Đang upload file lên Supabase Storage...')

        // Upload file lên Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filename, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: false, // Không ghi đè file cũ
                cacheControl: '3600', // Cache 1 giờ
            })

        if (error) {
            console.error('❌ Supabase upload error:', error)
            console.error('   Error message:', error.message)
            // StorageError không có statusCode, chỉ có message
            return null
        }

        if (!data) {
            console.error('❌ Upload không trả về data!')
            return null
        }

        console.log('✅ Upload thành công!')
        console.log('   Path:', data.path)
        console.log('   Full path:', data.fullPath)

        // Lấy public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

        console.log('✅ Public URL:', urlData.publicUrl)

        return {
            url: urlData.publicUrl,
            path: data.path,
        }
    } catch (error) {
        console.error('❌ Error uploading to Supabase:', error)
        if (error instanceof Error) {
            console.error('   Error message:', error.message)
            console.error('   Error stack:', error.stack)
        }
        return null
    }
}

// Helper function để xóa file từ Supabase Storage
export async function deleteImageFromSupabase(
    path: string,
    bucket: string = 'products'
): Promise<boolean> {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path])
        if (error) {
            console.error('❌ Supabase delete error:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('❌ Error deleting from Supabase:', error)
        return false
    }
}


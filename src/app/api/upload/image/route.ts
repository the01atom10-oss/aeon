import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImageToSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await req.formData()
        const file = formData.get('image') as File // Changed from 'file' to 'image'

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            )
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const extension = file.name.split('.').pop()
        const filename = `${timestamp}-${randomString}.${extension}`

        console.log('📝 [API] Bắt đầu upload ảnh...')
        console.log('   Filename:', filename)
        console.log('   File size:', file.size)
        console.log('   File type:', file.type)

        // Kiểm tra Supabase credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ [API] Supabase credentials chưa được cấu hình!')
            console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'MISSING')
            console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING')
            return NextResponse.json(
                { error: 'Supabase credentials chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env' },
                { status: 500 }
            )
        }

        // Upload to Supabase Storage
        const uploadResult = await uploadImageToSupabase(file, filename, 'products')

        if (!uploadResult) {
            console.error('❌ [API] Upload thất bại!')
            return NextResponse.json(
                { error: 'Failed to upload image to Supabase Storage. Kiểm tra console log để biết chi tiết.' },
                { status: 500 }
            )
        }

        console.log('✅ [API] Upload thành công!')
        console.log('   URL:', uploadResult.url)
        console.log('   Path:', uploadResult.path)

        return NextResponse.json({
            success: true,
            url: uploadResult.url,
            path: uploadResult.path,
            message: 'Image uploaded successfully to Supabase Storage'
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}


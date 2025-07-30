import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCategory, getCategories } from '@/lib/actions/categories'
import { CategoryCreateInput } from '@/lib/models/category'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const categories = await getCategories(status)
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cek role - hanya admin, gudang yang bisa create kategori
    if (!['admin', 'gudang'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: CategoryCreateInput = await request.json()
    
    // Validasi data yang diperlukan
    if (!body.nama) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    const category = await createCategory(body, session.user.id)
    
    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    console.error('Create category error:', error)
    const message = error instanceof Error ? error.message : 'Gagal membuat kategori'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

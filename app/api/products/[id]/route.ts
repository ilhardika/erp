import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProductById, updateProduct, deleteProduct } from '@/lib/actions/products'
import { ProductUpdateInput } from '@/lib/models/product'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const product = await getProductById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cek role - hanya admin, gudang yang bisa update produk
    if (!['admin', 'gudang'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: ProductUpdateInput = await request.json()
    
    // Validasi harga jika ada
    if (body.hargaBeli !== undefined && body.hargaBeli < 0) {
      return NextResponse.json(
        { error: 'Harga beli tidak boleh negatif' },
        { status: 400 }
      )
    }

    if (body.hargaJual !== undefined && body.hargaJual < 0) {
      return NextResponse.json(
        { error: 'Harga jual tidak boleh negatif' },
        { status: 400 }
      )
    }

    const { id } = await params
    const product = await updateProduct(id, body)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error: unknown) {
    console.error('Update product error:', error)
    const message = error instanceof Error ? error.message : 'Gagal mengupdate produk'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cek role - hanya admin yang bisa delete produk
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const success = await deleteProduct(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error: unknown) {
    console.error('Delete product error:', error)
    const message = error instanceof Error ? error.message : 'Gagal menghapus produk'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

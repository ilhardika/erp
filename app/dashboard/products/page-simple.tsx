"use client"

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { ProductForm } from '@/components/forms/product-form'
import { Product, ProductCreateInput } from '@/lib/models/product'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Gagal mengambil data produk')
      
      const data: ProductsResponse = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStockStatus = (product: Product) => {
    if (product.stok <= 0) 
      return { label: 'Habis', className: 'bg-red-100 text-red-800' }
    if (product.stok <= product.stokMinimal) 
      return { label: 'Menipis', className: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Aman', className: 'bg-green-100 text-green-800' }
  }

  const handleCreateProduct = async (data: ProductCreateInput) => {
    try {
      setCreateLoading(true)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal membuat produk')
      }

      await fetchProducts()
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Error creating product:', error)
      alert(error instanceof Error ? error.message : 'Gagal membuat produk')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data produk, stok, dan harga penjualan
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Memuat data produk...</div>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada produk</h3>
              <p className="text-muted-foreground">
                {search ? 'Tidak ada produk yang sesuai pencarian.' : 'Belum ada produk yang terdaftar.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => {
            const stockStatus = getStockStatus(product)
            return (
              <Card key={product._id?.toString()}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{product.nama}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{product.kode}</p>
                      {product.deskripsi && (
                        <p className="text-sm text-muted-foreground mt-1">{product.deskripsi}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Kategori</span>
                      <Badge variant="outline" className="mt-1">
                        {product.kategori}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Harga Jual</span>
                      <span className="font-semibold text-lg">{formatRupiah(product.hargaJual)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Stok</span>
                      <span className="font-medium">{product.stok} {product.satuan}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Status</span>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge variant="outline" className={stockStatus.className}>
                          {stockStatus.label}
                        </Badge>
                        <Badge variant={product.status === 'aktif' ? 'default' : 'secondary'}>
                          {product.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Product Modal */}
      <ResponsiveModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Tambah Produk Baru"
        description="Isi form di bawah untuk menambahkan produk baru ke sistem"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setShowCreateDialog(false)}
          loading={createLoading}
        />
      </ResponsiveModal>
    </div>
  )
}

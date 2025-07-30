import clientPromise from '@/lib/mongodb'
import { Product, ProductCreateInput, ProductUpdateInput } from '@/lib/models/product'
import { ObjectId } from 'mongodb'

export async function createProduct(data: ProductCreateInput, userId: string): Promise<Product> {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  // Generate kode produk otomatis jika tidak ada
  let kode = data.kode
  if (!kode) {
    const lastProduct = await collection.findOne({}, { sort: { _id: -1 } })
    const lastNumber = lastProduct?.kode ? parseInt(lastProduct.kode.replace('PRD', '')) : 0
    kode = `PRD${String(lastNumber + 1).padStart(6, '0')}`
  }

  // Cek apakah kode sudah ada
  const existingProduct = await collection.findOne({ kode })
  if (existingProduct) {
    throw new Error('Kode produk sudah digunakan')
  }

  const product: Omit<Product, '_id'> = {
    ...data,
    kode,
    status: data.status || 'aktif',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId
  }

  const result = await collection.insertOne(product)
  
  return {
    ...product,
    _id: result.insertedId
  }
}

export async function getProducts(
  page: number = 1,
  limit: number = 10,
  search?: string,
  kategori?: string,
  status?: string
) {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  // Build filter
  const filter: Record<string, unknown> = {}
  
  if (search) {
    filter.$or = [
      { kode: { $regex: search, $options: 'i' } },
      { nama: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } }
    ]
  }
  
  if (kategori) {
    filter.kategori = kategori
  }
  
  if (status) {
    filter.status = status
  }

  const skip = (page - 1) * limit
  
  const [products, total] = await Promise.all([
    collection.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter)
  ])

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  return await collection.findOne({ _id: new ObjectId(id) })
}

export async function updateProduct(id: string, data: ProductUpdateInput): Promise<Product | null> {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  const updateData = {
    ...data,
    updatedAt: new Date()
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  )

  return result || null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function updateStok(id: string, stokBaru: number): Promise<Product | null> {
  return await updateProduct(id, { stok: stokBaru })
}

export async function getLowStockProducts(): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db('bizflow')
  const collection = db.collection<Product>('products')

  return await collection.find({
    $expr: { $lte: ['$stok', '$stokMinimal'] },
    status: 'aktif'
  }).toArray()
}

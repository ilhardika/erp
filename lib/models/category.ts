import { ObjectId } from 'mongodb'

export interface Category {
  _id?: ObjectId
  nama: string
  deskripsi?: string
  status: 'aktif' | 'nonaktif'
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CategoryCreateInput {
  nama: string
  deskripsi?: string
  status?: 'aktif' | 'nonaktif'
}

export interface CategoryUpdateInput {
  nama?: string
  deskripsi?: string
  status?: 'aktif' | 'nonaktif'
}

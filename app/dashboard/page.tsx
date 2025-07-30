'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session } = useSession()

  const getRoleBasedMenus = (role: string) => {
    const baseMenus = [
      { name: 'Dashboard', href: '/dashboard', description: 'Halaman utama' }
    ]

    const roleMenus: Record<string, Array<{ name: string; href: string; description: string }>> = {
      admin: [
        { name: 'POS', href: '/dashboard/pos', description: 'Point of Sale' },
        { name: 'Produk', href: '/dashboard/products', description: 'Kelola produk' },
        { name: 'Pelanggan', href: '/dashboard/customers', description: 'Kelola pelanggan' },
        { name: 'Karyawan', href: '/dashboard/employees', description: 'Kelola karyawan' },
        { name: 'Laporan', href: '/dashboard/reports', description: 'Laporan bisnis' },
        { name: 'Pengaturan', href: '/dashboard/settings', description: 'Pengaturan sistem' }
      ],
      kasir: [
        { name: 'POS', href: '/dashboard/pos', description: 'Point of Sale' },
        { name: 'Riwayat Transaksi', href: '/dashboard/pos/history', description: 'Histori transaksi' }
      ],
      gudang: [
        { name: 'Produk', href: '/dashboard/products', description: 'Kelola produk' },
        { name: 'Stok Opname', href: '/dashboard/inventory/stock-opname', description: 'Stok opname' },
        { name: 'Mutasi Stok', href: '/dashboard/inventory/mutation', description: 'Mutasi stok' }
      ],
      sales: [
        { name: 'Order Penjualan', href: '/dashboard/sales/orders', description: 'Kelola order' },
        { name: 'Pelanggan', href: '/dashboard/customers', description: 'Kelola pelanggan' },
        { name: 'Laporan Sales', href: '/dashboard/reports/salesman', description: 'Performa sales' }
      ],
      hrd: [
        { name: 'Karyawan', href: '/dashboard/employees', description: 'Kelola karyawan' },
        { name: 'Absensi', href: '/dashboard/attendance', description: 'Kelola absensi' },
        { name: 'Payroll', href: '/dashboard/payroll', description: 'Slip gaji' }
      ],
      akuntan: [
        { name: 'Transaksi Keuangan', href: '/dashboard/finance/transactions', description: 'Kas masuk/keluar' },
        { name: 'Jurnal', href: '/dashboard/finance/journal', description: 'Jurnal umum' },
        { name: 'Laporan Keuangan', href: '/dashboard/reports/finance', description: 'Laporan keuangan' }
      ]
    }

    return [...baseMenus, ...(roleMenus[role] || [])]
  }

  const menus = session?.user?.role ? getRoleBasedMenus(session.user.role) : []

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Selamat Datang di BizFlow
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistem ERP + POS untuk mengelola bisnis Anda
          </p>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Menu yang Tersedia untuk Role: {session?.user?.role}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {menu.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {menu.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>
              Role Anda: <span className="font-medium text-blue-600">{session?.user?.role}</span>
            </p>
            <p>
              Email: <span className="font-medium">{session?.user?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

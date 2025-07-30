"use client"

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Package, Users, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  const quickStats = [
    {
      title: 'Total Penjualan Hari Ini',
      value: 'Rp 0',
      description: 'Penjualan 24 jam terakhir',
      icon: TrendingUp,
      trend: '+0%'
    },
    {
      title: 'Transaksi Hari Ini',
      value: '0',
      description: 'Jumlah transaksi selesai',
      icon: CreditCard,
      trend: '+0%'
    },
    {
      title: 'Produk Aktif',
      value: '0',
      description: 'Total produk tersedia',
      icon: Package,
      trend: '+0%'
    },
    {
      title: 'Stok Menipis',
      value: '0',
      description: 'Produk perlu restok',
      icon: AlertTriangle,
      trend: 'Perhatian'
    }
  ]

  const recentActivities = [
    { action: 'Sistem dimulai', time: 'Baru saja', type: 'info' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session?.user?.name}! Berikut ringkasan bisnis Anda hari ini.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Chart Area */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Penjualan Mingguan</CardTitle>
            <CardDescription>
              Grafik penjualan 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Grafik akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Log aktivitas sistem terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Akses cepat ke fitur yang sering digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Buka POS</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Mulai transaksi penjualan</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Tambah Produk</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Daftarkan produk baru</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Tambah Pelanggan</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Daftarkan pelanggan baru</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Lihat Laporan</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Analisis performa bisnis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

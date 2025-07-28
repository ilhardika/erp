import React from "react";
import { Header } from "../../components/Header";

const Card = ({ title, value, description, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="text-2xl sm:text-3xl">{icon}</div>
      <div className="text-right">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <p className="text-xs sm:text-sm text-gray-600">{description}</p>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Dashboard ERP
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Selamat datang di sistem ERP untuk bisnis Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            title="Total Penjualan Hari Ini"
            value="Rp 2.450.000"
            description="↗ 12% dari kemarin"
            icon="💰"
          />
          <Card
            title="Pesanan Baru"
            value="24"
            description="↗ 8% dari kemarin"
            icon="📦"
          />
          <Card
            title="Stok Menipis"
            value="7"
            description="Perlu restock segera"
            icon="⚠️"
          />
          <Card
            title="Pelanggan Aktif"
            value="156"
            description="↗ 5% dari minggu lalu"
            icon="👥"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <button className="p-3 sm:p-4 hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200">
                <div className="text-2xl mb-2">🛒</div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  POS Penjualan
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Proses transaksi
                </p>
              </button>
              <button className="p-3 sm:p-4 hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200">
                <div className="text-2xl mb-2">📦</div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Kelola Produk
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tambah/edit produk
                </p>
              </button>
              <button className="p-3 sm:p-4 hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Laporan
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Lihat analisis
                </p>
              </button>
              <button className="p-3 sm:p-4 hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200">
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Pengaturan
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Konfigurasi sistem
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Aktivitas Terbaru
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      Penjualan #001234
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Rp 150.000 - 5 menit lalu
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      Produk baru ditambahkan
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Kopi Arabica Premium - 15 menit lalu
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      Stok rendah
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Gula pasir - tersisa 5 kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Penjualan 7 Hari Terakhir
          </h2>
          <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📈</div>
              <p className="text-sm sm:text-base text-gray-600">
                Grafik penjualan akan ditampilkan di sini
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Integrasi dengan Chart.js atau library lainnya
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

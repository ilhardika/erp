import { Header } from "./components/Header";
import { useUser } from "@clerk/react-router";

function App() {
  const { isLoaded } = useUser();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Penjualan
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">Rp 0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Produk</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Pelanggan</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Pesanan</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Aktivitas Terbaru
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">Belum ada aktivitas</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Grafik Penjualan
            </h3>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Grafik akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        404 - Halaman Tidak Ditemukan
      </h1>
      <Link href="/dashboard">
        <button className="px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">
          Kembali ke Dashboard
        </button>
      </Link>
    </div>
  );
}

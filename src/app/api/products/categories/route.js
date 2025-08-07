import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Static categories for now - you can later fetch from database
    const categories = [
      "Elektronik",
      "Pakaian",
      "Makanan & Minuman",
      "Buku",
      "Rumah & Taman",
      "Olahraga",
      "Mainan",
      "Kesehatan & Kecantikan",
      "Otomotif",
      "Perlengkapan Kantor",
    ];

    return NextResponse.json({
      success: true,
      data: categories,
      message: "Kategori berhasil diambil",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data kategori",
      },
      { status: 500 }
    );
  }
}

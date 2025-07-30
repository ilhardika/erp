import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProduct, getProducts } from "@/lib/actions/products";
import { ProductCreateInput } from "@/lib/models/product";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const kategori = searchParams.get("kategori") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await getProducts(
      session.user.id,
      page,
      limit,
      search,
      kategori,
      status
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cek role - hanya admin, gudang yang bisa create produk
    if (!["admin", "gudang"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: ProductCreateInput = await request.json();

    // Validasi data yang diperlukan
    if (!body.nama || !body.kategori || !body.hargaBeli || !body.hargaJual) {
      return NextResponse.json(
        { error: "Nama, kategori, harga beli, dan harga jual wajib diisi" },
        { status: 400 }
      );
    }

    if (body.hargaBeli < 0 || body.hargaJual < 0) {
      return NextResponse.json(
        { error: "Harga tidak boleh negatif" },
        { status: 400 }
      );
    }

    const product = await createProduct(body, session.user.id);

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Create product error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat produk";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

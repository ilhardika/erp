import { NextResponse } from "next/server";
import { getSatuans, addSatuan } from "@/lib/actions/satuans";

export async function GET() {
  const satuans = await getSatuans();
  return NextResponse.json(satuans);
}

export async function POST(req: Request) {
  const { nama } = await req.json();
  if (!nama || !nama.trim()) {
    return NextResponse.json(
      { error: "Nama satuan wajib diisi" },
      { status: 400 }
    );
  }
  const satuan = await addSatuan(nama.trim());
  return NextResponse.json(satuan);
}

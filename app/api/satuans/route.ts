import { NextResponse } from "next/server";
import { getSatuans, addSatuan } from "@/lib/actions/satuans";

export async function GET() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const satuans = await getSatuans(session.user.id);
  return NextResponse.json(satuans);
}

export async function POST(req: Request) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { nama } = await req.json();
  if (!nama || !nama.trim()) {
    return NextResponse.json(
      { error: "Nama satuan wajib diisi" },
      { status: 400 }
    );
  }
  const satuan = await addSatuan(nama.trim(), session.user.id);
  return NextResponse.json(satuan);
}

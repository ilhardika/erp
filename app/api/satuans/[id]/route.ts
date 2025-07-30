import { NextResponse } from "next/server";
import { deleteSatuan } from "@/lib/actions/satuans";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID satuan wajib" }, { status: 400 });
  }
  await deleteSatuan(id);
  return NextResponse.json({ success: true });
}

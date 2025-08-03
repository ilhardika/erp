// Fungsi client-side untuk satuan
export async function createSatuanApi(name: string) {
  const response = await fetch("/api/satuans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menambah satuan");
  }
  return response.json();
}

export async function deleteSatuanApi(id: string) {
  const response = await fetch(`/api/satuans/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menghapus satuan");
  }
  return response.json();
}

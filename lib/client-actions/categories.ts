// Fungsi client-side untuk kategori
export async function createCategoryApi(name: string) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menambah kategori");
  }
  return response.json();
}

export async function deleteCategoryApi(id: string) {
  const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menghapus kategori");
  }
  return response.json();
}

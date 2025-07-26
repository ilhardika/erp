import * as XLSX from "xlsx";

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename without extension
 * @param {string} sheetName - Excel sheet name
 */
export const exportToExcel = (data, filename, sheetName = "Data") => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fullFilename);
    return true;
  } catch (error) {
    console.error("Export to Excel failed:", error);
    return false;
  }
};

/**
 * Export sales report to Excel
 * @param {Array} salesData - Sales transactions data
 * @returns {boolean} Success status
 */
export const exportSalesReport = (salesData) => {
  const formattedData = salesData.map((sale) => ({
    Tanggal: new Date(sale.createdAt).toLocaleDateString("id-ID"),
    "No. Transaksi": sale.transactionNumber,
    Kasir: sale.cashier,
    Customer: sale.customer || "Walk-in",
    Subtotal: sale.subtotal,
    Pajak: sale.tax,
    Total: sale.total,
    Payment: sale.paymentMethod,
    Status: sale.status,
  }));

  return exportToExcel(formattedData, "laporan_penjualan", "Penjualan");
};

/**
 * Export product inventory to Excel
 * @param {Array} products - Products data
 * @returns {boolean} Success status
 */
export const exportInventoryReport = (products) => {
  const formattedData = products.map((product) => ({
    Kode: product.code,
    Barcode: product.barcode || "-",
    "Nama Produk": product.name,
    Kategori: product.category,
    "Harga Retail": product.retailPrice,
    "Harga Grosir": product.wholesalePrice,
    Stok: product.stock,
    "Min. Stok": product.minStock,
    Status: product.stock <= product.minStock ? "Low Stock" : "Normal",
  }));

  return exportToExcel(formattedData, "laporan_inventory", "Inventory");
};

/**
 * Generate and download CSV file
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename without extension
 */
export const exportToCSV = (data, filename) => {
  try {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return true;
  } catch (error) {
    console.error("Export to CSV failed:", error);
    return false;
  }
};

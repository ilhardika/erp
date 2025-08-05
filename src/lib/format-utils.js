// Format utilities for consistent data display across the app

export const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  if (!dateString) return "Tidak tersedia";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Format tanggal tidak valid";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return "Tidak tersedia";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Format tanggal tidak valid";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getStockStatus = (stock, minStock) => {
  if (stock <= 0) return { label: "Stok Habis", color: "destructive" };
  if (stock <= minStock) return { label: "Stok Rendah", color: "warning" };
  return { label: "Stok Tersedia", color: "success" };
};

export const getCustomerTypeLabel = (type) => {
  const labels = {
    retail: "Retail",
    wholesale: "Grosir",
    corporate: "Korporat",
  };
  return labels[type] || type;
};

export const getCustomerTypeVariant = (type) => {
  const variants = {
    retail: "secondary",
    wholesale: "outline",
    corporate: "default",
  };
  return variants[type] || "secondary";
};

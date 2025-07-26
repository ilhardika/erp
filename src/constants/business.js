/**
 * Business constants and configuration
 */

export const BUSINESS_CONFIG = {
  name: "BizFlow ERP+POS",
  address: "Jl. Bisnis No. 123, Jakarta",
  phone: "+62 21 1234567",
  email: "info@bizflow.com",
  website: "www.bizflow.com",
  currency: "IDR",
  timezone: "Asia/Jakarta",
};

export const USER_ROLES = {
  ADMIN: "admin",
  KASIR: "kasir",
  MANAGER: "manager",
};

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  TRANSFER: "transfer",
  QRIS: "qris",
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
};

export const PRODUCT_CATEGORIES = [
  "Makanan & Minuman",
  "Elektronik",
  "Fashion",
  "Kesehatan & Kecantikan",
  "Rumah Tangga",
  "Olahraga",
  "Otomotif",
  "Buku & Alat Tulis",
  "Mainan & Hobi",
  "Lainnya",
];

export const STOCK_MOVEMENT_TYPES = {
  IN: "in",
  OUT: "out",
  ADJUSTMENT: "adjustment",
  TRANSFER: "transfer",
};

export const REPORT_PERIODS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  THIS_WEEK: "this_week",
  LAST_WEEK: "last_week",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom",
};

export const TABLE_PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 100,
  MAX_PRICE: 999999999,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
};

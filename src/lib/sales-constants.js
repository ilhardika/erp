/**
 * Sales module constants
 * Centralized constants for sales orders and related functionality
 */

export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
];

export const STATUS_LABELS = {
  draft: "Draft",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
};

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
};

export const FORM_DEFAULTS = {
  salesOrder: {
    customer_id: "",
    salesperson_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    notes: "",
    shipping_address: "",
    terms_conditions: "",
    items: [
      {
        product_id: "",
        quantity: 1,
        unit_price: 0,
        discount_percentage: 0,
        notes: "",
      },
    ],
  },
};

/**
 * Purchase module constants
 * Centralized constants for purchase orders and related functionality
 */

export const PURCHASE_ORDER_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  RECEIVED: "received",
};

export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  pending_approval: "bg-orange-100 text-orange-800",
  approved: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  received: "bg-green-100 text-green-800",
};

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "received", label: "Diterima" },
];

export const STATUS_LABELS = {
  draft: "Draft",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  received: "Diterima",
};

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
};

export const FORM_DEFAULTS = {
  purchaseOrder: {
    supplier_id: "",
    purchaser_id: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_date: "",
    status: "draft",
    notes: "",
    shipping_address: "",
    terms_conditions: "",
    items: [
      {
        product_id: "",
        quantity: 1,
        unit_cost: 0,
        discount_percentage: 0,
        notes: "",
      },
    ],
  },
};

/**
 * Purchase module constants
 * Centralized constants for purchase orders and related functionality
 */

// Purchase Order Status
export const PURCHASE_ORDER_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  RECEIVED: "received",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PURCHASE_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  received: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const PO_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Dikirim" },
  { value: "received", label: "Diterima Sebagian" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export const RECEIPT_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const RECEIPT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export const PURCHASE_STATUS_LABELS = {
  draft: "Draft",
  sent: "Dikirim",
  received: "Diterima Sebagian",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const RECEIPT_STATUS_LABELS = {
  pending: "Pending",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const PURCHASE_FORM_DEFAULTS = {
  supplier_id: "",
  order_date: new Date().toISOString().split("T")[0],
  expected_date: "",
  notes: "",
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
};

// Progressive status validation for PO (only allow forward movement)
export const getAvailableStatusTransitions = (currentStatus) => {
  const statusLevels = {
    draft: 0,
    sent: 1,
    received: 2,
    completed: 3,
    cancelled: -1, // Special case - can be set from any status except completed
  };

  const currentLevel = statusLevels[currentStatus] || 0;

  return PO_STATUS_OPTIONS.filter((option) => {
    const optionLevel = statusLevels[option.value];

    // Allow cancelled from any status except completed
    if (option.value === "cancelled" && currentStatus !== "completed") {
      return true;
    }

    // Allow forward progression only
    return optionLevel > currentLevel;
  }).map((option) => option.value);
};

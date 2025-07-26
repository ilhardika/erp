/**
 * Tax calculation utilities for Indonesian business
 */

export const TAX_RATES = {
  PPN: 0.11, // PPN 11%
  PPH21: 0.05, // PPh21 5% (simplified)
  SERVICE: 0.05, // Service charge 5%
};

/**
 * Calculate tax and total amount
 * @param {number} subtotal - Amount before tax
 * @param {number} taxRate - Tax rate (default: PPN 11%)
 * @param {number} discount - Discount amount
 * @returns {object} Calculation result
 */
export const calculateTax = (
  subtotal,
  taxRate = TAX_RATES.PPN,
  discount = 0
) => {
  const discountedAmount = subtotal - discount;
  const tax = discountedAmount * taxRate;
  const total = discountedAmount + tax;

  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    discountedAmount: Math.round(discountedAmount),
    tax: Math.round(tax),
    total: Math.round(total),
    taxRate: taxRate * 100, // untuk display sebagai percentage
  };
};

/**
 * Calculate POS transaction total
 * @param {Array} items - Array of cart items
 * @param {number} discount - Discount amount
 * @param {number} taxRate - Tax rate
 * @returns {object} Transaction calculation
 */
export const calculatePOSTotal = (
  items,
  discount = 0,
  taxRate = TAX_RATES.PPN
) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return calculateTax(subtotal, taxRate, discount);
};

/**
 * Calculate change for cash payment
 * @param {number} total - Total amount to pay
 * @param {number} cashPaid - Cash amount paid
 * @returns {number} Change amount
 */
export const calculateChange = (total, cashPaid) => {
  return Math.max(0, cashPaid - total);
};

/**
 * Format currency to Indonesian Rupiah
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

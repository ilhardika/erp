/**
 * Currency formatting utilities for Indonesian Rupiah (IDR)
 * Provides consistent currency formatting across the application
 */

/**
 * Format number to Indonesian Rupiah currency
 * @param {number|string} amount - The amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showSymbol - Whether to show currency symbol (default: true)
 * @param {number} options.minimumFractionDigits - Minimum decimal places (default: 0)
 * @param {number} options.maximumFractionDigits - Maximum decimal places (default: 0)
 * @param {boolean} options.compact - Use compact notation for large numbers (default: false)
 * @returns {string} Formatted currency string
 */
export const formatIDR = (amount, options = {}) => {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === "") {
    return showSymbol ? "Rp 0" : "0";
  }

  // Convert to number if it's a string
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numericAmount)) {
    return showSymbol ? "Rp 0" : "0";
  }

  const formatOptions = {
    style: showSymbol ? "currency" : "decimal",
    currency: "IDR",
    minimumFractionDigits,
    maximumFractionDigits,
    ...(compact && { notation: "compact", compactDisplay: "short" }),
  };

  try {
    const formatted = new Intl.NumberFormat("id-ID", formatOptions).format(
      numericAmount
    );

    // If not showing symbol and using currency style, remove the currency symbol
    if (!showSymbol && formatOptions.style === "currency") {
      return formatted.replace(/Rp\s?/, "").trim();
    }

    return formatted;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return showSymbol
      ? `Rp ${numericAmount.toLocaleString("id-ID")}`
      : numericAmount.toLocaleString("id-ID");
  }
};

/**
 * Format currency for display in tables and lists
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string without decimals
 */
export const formatCurrency = (amount) => {
  return formatIDR(amount, { showSymbol: true, minimumFractionDigits: 0 });
};

/**
 * Format currency for compact display (K, M, B notation)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string in compact notation
 */
export const formatCurrencyCompact = (amount) => {
  return formatIDR(amount, { showSymbol: true, compact: true });
};

/**
 * Format currency without symbol (for inputs)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number string without currency symbol
 */
export const formatCurrencyInput = (amount) => {
  return formatIDR(amount, { showSymbol: false });
};

/**
 * Parse formatted currency string back to number
 * @param {string} formattedAmount - The formatted currency string
 * @returns {number} Parsed numeric value
 */
export const parseCurrency = (formattedAmount) => {
  if (!formattedAmount || typeof formattedAmount !== "string") {
    return 0;
  }

  // Remove currency symbol, spaces, and thousands separators
  const cleaned = formattedAmount
    .replace(/Rp\s?/g, "") // Remove Rp symbol
    .replace(/\s/g, "") // Remove spaces
    .replace(/\./g, "") // Remove thousands separators (dots in ID locale)
    .replace(/,/g, "."); // Convert decimal comma to dot

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate if a string is a valid currency amount
 * @param {string} value - The value to validate
 * @returns {boolean} True if valid currency format
 */
export const isValidCurrency = (value) => {
  if (!value || typeof value !== "string") return false;

  const cleaned = value
    .replace(/Rp\s?/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
};

/**
 * Format currency input with real-time formatting
 * Useful for input fields that format as user types
 * @param {string} value - The input value
 * @returns {string} Formatted value for input display
 */
export const formatCurrencyOnType = (value) => {
  if (!value) return "";

  // Remove all non-digit characters
  const numbersOnly = value.replace(/\D/g, "");

  if (!numbersOnly) return "";

  // Convert to number and format
  const number = parseInt(numbersOnly, 10);
  return number.toLocaleString("id-ID");
};

/**
 * Convert formatted input value to raw number for API submission
 * @param {string} formattedValue - The formatted input value
 * @returns {number} Raw numeric value
 */
export const getCurrencyValue = (formattedValue) => {
  if (!formattedValue) return 0;

  const numbersOnly = formattedValue.replace(/\D/g, "");
  return numbersOnly ? parseInt(numbersOnly, 10) : 0;
};

/**
 * Format currency range (for price ranges, etc.)
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @param {object} options - Formatting options
 * @returns {string} Formatted range string
 */
export const formatCurrencyRange = (min, max, options = {}) => {
  const { compact = false } = options;

  if (min === max) {
    return formatIDR(min, { compact });
  }

  const formatOptions = { compact };
  return `${formatIDR(min, formatOptions)} - ${formatIDR(max, formatOptions)}`;
};

/**
 * Calculate and format percentage difference
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {object} Object with percentage and formatted string
 */
export const formatCurrencyChange = (oldValue, newValue) => {
  if (!oldValue || oldValue === 0) {
    return {
      percentage: newValue > 0 ? 100 : 0,
      formatted: newValue > 0 ? "+100%" : "0%",
      direction: newValue > 0 ? "up" : "neutral",
    };
  }

  const difference = newValue - oldValue;
  const percentage = (difference / oldValue) * 100;
  const direction = difference > 0 ? "up" : difference < 0 ? "down" : "neutral";

  return {
    percentage: Math.abs(percentage),
    formatted: `${difference >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
    direction,
    amount: formatIDR(difference),
  };
};

// Default export for main formatting function
export default formatIDR;

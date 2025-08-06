// POS-related utility functions

export const formatIDR = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateChange = (received, total) => {
  return Math.max(0, received - total);
};

export const validatePayment = (paymentMethod, paymentAmount, total) => {
  if (paymentMethod === "cash") {
    const received = parseFloat(paymentAmount) || 0;
    return received >= total;
  }
  // For non-cash payments, amount should equal total
  return parseFloat(paymentAmount) === total;
};

export const createTransactionData = (
  cart,
  customer,
  discount,
  tax,
  paymentMethod,
  paymentAmount
) => {
  return {
    items: cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
    customer_id: customer?.id || null,
    discount_amount: discount,
    tax_amount: tax,
    payment_method: paymentMethod,
    payment_received: parseFloat(paymentAmount) || 0,
    notes: "",
  };
};

"use client";

import { useState, useEffect, useCallback } from "react";

export function usePayment() {
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [customer, setCustomer] = useState(null);

  const openPaymentDialog = useCallback(() => {
    setPaymentDialog(true);
  }, []);

  const closePaymentDialog = useCallback(() => {
    setPaymentDialog(false);
    setPaymentAmount("");
  }, []);

  const updatePaymentMethod = useCallback((method) => {
    setPaymentMethod(method);
  }, []);

  const updatePaymentAmount = useCallback((amount) => {
    setPaymentAmount(amount);
  }, []);

  const updateCustomer = useCallback((customerData) => {
    setCustomer(customerData);
  }, []);

  const resetPaymentState = useCallback(() => {
    setPaymentMethod("cash");
    setPaymentAmount("");
    setCustomer(null);
    setPaymentDialog(false);
  }, []);

  // Auto-set payment amount for non-cash payments
  const autoSetPaymentAmount = useCallback(
    (total) => {
      if (paymentMethod !== "cash" && paymentDialog) {
        setPaymentAmount(total.toString());
      }
    },
    [paymentMethod, paymentDialog]
  );

  return {
    // State
    paymentDialog,
    paymentMethod,
    paymentAmount,
    customer,

    // Actions
    openPaymentDialog,
    closePaymentDialog,
    updatePaymentMethod,
    updatePaymentAmount,
    updateCustomer,
    resetPaymentState,
    autoSetPaymentAmount,
  };
}

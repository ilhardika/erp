"use client";

import { useState, useCallback } from "react";

export function useAlerts() {
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [successDialog, setSuccessDialog] = useState({
    open: false,
    title: "",
    message: "",
  });

  const showAlert = useCallback((title, message) => {
    setAlertDialog({
      open: true,
      title,
      message,
    });
  }, []);

  const showSuccess = useCallback((title, message) => {
    setSuccessDialog({
      open: true,
      title,
      message,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const closeSuccess = useCallback(() => {
    setSuccessDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const closeAllDialogs = useCallback(() => {
    closeAlert();
    closeSuccess();
  }, [closeAlert, closeSuccess]);

  return {
    // State
    alertDialog,
    successDialog,

    // Actions
    showAlert,
    showSuccess,
    closeAlert,
    closeSuccess,
    closeAllDialogs,
  };
}

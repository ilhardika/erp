"use client";

import { useState, useCallback, useEffect } from "react";

export function useShift() {
  const [shift, setShift] = useState(null);

  const checkShiftStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/pos/shift", {
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setShift(result.data);
      }
    } catch (error) {
      }
  }, []);

  const updateShift = useCallback((shiftData) => {
    setShift(shiftData);
  }, []);

  useEffect(() => {
    checkShiftStatus();
  }, [checkShiftStatus]);

  return {
    // State
    shift,

    // Actions
    checkShiftStatus,
    updateShift,
  };
}


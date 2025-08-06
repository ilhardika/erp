"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  formatCurrencyOnType,
  parseCurrency,
  isValidCurrency,
} from "@/lib/currency";

const CurrencyInput = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "0",
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");

    // Initialize display value when value prop changes
    useEffect(() => {
      if (value !== undefined && value !== null && value !== "") {
        const numericValue =
          typeof value === "string" ? parseCurrency(value) : value;
        if (numericValue > 0) {
          setDisplayValue(formatCurrencyOnType(numericValue.toString()));
        } else {
          setDisplayValue("");
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleInputChange = (e) => {
      const inputValue = e.target.value;

      // Allow empty input
      if (inputValue === "") {
        setDisplayValue("");
        // Create synthetic event with empty string but proper name
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: "",
          },
        };
        onChange?.(syntheticEvent);
        return;
      }

      // Validate and format the input
      if (isValidCurrency(inputValue)) {
        const formattedValue = formatCurrencyOnType(inputValue);
        setDisplayValue(formattedValue);

        // Create synthetic event with raw numeric value
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: parseCurrency(inputValue).toString(),
          },
        };
        onChange?.(syntheticEvent);
      }
    };

    const handleBlur = (e) => {
      // Clean up formatting on blur
      if (displayValue && displayValue !== "Rp 0") {
        const numericValue = parseCurrency(displayValue);
        if (numericValue > 0) {
          setDisplayValue(formatCurrencyOnType(numericValue.toString()));
        } else {
          setDisplayValue("");
        }
      }
      props.onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

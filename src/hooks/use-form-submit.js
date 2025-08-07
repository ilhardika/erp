import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom hook untuk standardisasi form submissions
 * @param {Object} options - Konfigurasi untuk form submission
 */
export const useFormSubmit = (options = {}) => {
  const {
    successMessage = "Data berhasil disimpan",
    errorMessage = "Gagal menyimpan data",
    redirectPath = null,
    onSuccess = null,
    onError = null,
  } = options;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Submit function
  const submit = useCallback(
    async (apiCall, formData, validationRules = {}) => {
      try {
        setLoading(true);
        setError("");
        setSuccess(false);

        // Validation
        const validationErrors = validateForm(formData, validationRules);
        if (validationErrors.length > 0) {
          setError(validationErrors.join(", "));
          return { success: false, error: validationErrors.join(", ") };
        }

        // API Call
        const result = await apiCall;

        if (result.success) {
          setSuccess(true);

          // Success callback
          if (onSuccess) {
            await onSuccess(result.data);
          }

          // Auto redirect
          if (redirectPath) {
            setTimeout(() => {
              router.push(redirectPath);
            }, 1000);
          }

          return { success: true, data: result.data };
        } else {
          const errorMsg = result.error || errorMessage;
          setError(errorMsg);

          // Error callback
          if (onError) {
            onError(errorMsg);
          }

          return { success: false, error: errorMsg };
        }
      } catch (err) {
        const errorMsg = errorMessage;
        setError(errorMsg);

        if (onError) {
          onError(errorMsg);
        }

        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [router, successMessage, errorMessage, redirectPath, onSuccess, onError]
  );

  // Reset form state
  const reset = useCallback(() => {
    setLoading(false);
    setError("");
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
    setError,
  };
};

/**
 * Form validation helper
 */
const validateForm = (formData, rules) => {
  const errors = [];

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && (!value || value.toString().trim() === "")) {
      errors.push(`${rule.label || field} harus diisi`);
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors.push(`${rule.label || field} minimal ${rule.minLength} karakter`);
    }

    if (rule.email && value && !isValidEmail(value)) {
      errors.push(`${rule.label || field} harus berupa email yang valid`);
    }

    if (
      rule.numeric &&
      value &&
      (isNaN(Number(value)) || value.toString().trim() === "")
    ) {
      errors.push(`${rule.label || field} harus berupa angka`);
    }

    if (rule.custom && value) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  });

  return errors;
};

/**
 * Email validation helper
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Hook untuk form data management dengan auto-generate codes
 */
export const useFormData = (initialData = {}, options = {}) => {
  const { autoGenerateCode = false, codePrefix = "CODE" } = options;
  const [formData, setFormData] = useState(initialData);
  const [hasGeneratedOnMount, setHasGeneratedOnMount] = useState(false);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update multiple fields
  const updateFields = useCallback((updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Generate code
  const generateCode = useCallback(
    (customPrefix = null) => {
      // More robust prefix handling
      let prefix = "CODE"; // default fallback

      if (customPrefix && typeof customPrefix === "string") {
        prefix = customPrefix;
      } else if (codePrefix && typeof codePrefix === "string") {
        prefix = codePrefix;
      }

      const timestamp = String(Date.now()).slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      const code = `${prefix}${timestamp}${random}`;

      updateField("code", code);
      return code;
    },
    [codePrefix, updateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  // Auto-generate code on mount only
  useEffect(() => {
    if (autoGenerateCode && !formData.code && !hasGeneratedOnMount) {
      generateCode();
      setHasGeneratedOnMount(true);
    }
  }, [autoGenerateCode, formData.code, generateCode, hasGeneratedOnMount]);

  return {
    formData,
    updateField,
    updateFields,
    generateCode,
    resetForm,
    setFormData,
  };
};

// Explicit imports to avoid ReferenceError in runtime
import { useApiCall } from "./use-api-call";
import { useFormSubmit, useFormData } from "./use-form-submit";
import { usePaginatedFetch } from "./use-data-fetch";
import { useDeleteDialog } from "./use-delete-dialog";

// API Hooks
export { useApiCall } from "./use-api-call";
export { useFormSubmit, useFormData } from "./use-form-submit";
export {
  useDataFetch,
  usePaginatedFetch,
  useItemFetch,
} from "./use-data-fetch";

// UI Hooks
export { useDeleteDialog } from "./use-delete-dialog";

// Business Logic Hooks (POS hooks might not exist yet)
// export { useCart, useProducts, useAlerts, usePayment, useShift } from './use-pos';

// PWA Hooks
export { usePWA } from "./use-pwa";

// Common validation patterns
export const VALIDATION_RULES = {
  required: (label) => ({ required: true, label }),
  email: (label) => ({ required: true, email: true, label }),
  minLength: (length, label) => ({ required: true, minLength: length, label }),
  numeric: (label) => ({ required: true, numeric: true, label }),
  code: (label) => ({
    required: true,
    minLength: 3,
    label,
    custom: (value) => {
      if (!/^[A-Z0-9]+$/.test(value)) {
        return `${label} harus menggunakan huruf kapital dan angka saja`;
      }
      return null;
    },
  }),
};

// Common API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  CUSTOMERS: "/api/customers",
  SUPPLIERS: "/api/suppliers",
  ORDERS: "/api/orders",
  TRANSACTIONS: "/api/transactions",
  USERS: "/api/users",
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    VERIFY: "/api/auth/verify",
  },
};

// Common form patterns
export const useStandardForm = (options = {}) => {
  const {
    endpoint,
    redirectPath,
    validationRules = {},
    initialData = {},
    autoGenerateCode = false,
    codePrefix = "CODE",
  } = options;

  const { post, put } = useApiCall();
  const {
    submit,
    loading,
    error,
    success,
    reset: resetSubmit,
  } = useFormSubmit({
    redirectPath,
    successMessage: options.successMessage,
    errorMessage: options.errorMessage,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const { formData, updateField, updateFields, generateCode, resetForm } =
    useFormData(initialData, { autoGenerateCode, codePrefix });

  const handleSubmit = async (isEdit = false) => {
    const apiCall = isEdit ? put(endpoint, formData) : post(endpoint, formData);

    return await submit(apiCall, formData, validationRules);
  };

  const reset = () => {
    resetSubmit();
    resetForm();
  };

  return {
    formData,
    updateField,
    updateFields,
    generateCode,
    handleSubmit,
    loading,
    error,
    success,
    reset,
  };
};

// Common data table pattern
export const useStandardDataTable = (endpoint, options = {}) => {
  const { deleteEndpoint = endpoint } = options;

  const {
    data,
    loading,
    error,
    pagination,
    filters,
    fetchData,
    changePage,
    changePageSize,
    updateSearch,
    updateSort,
    resetFilters,
    setData,
  } = usePaginatedFetch(endpoint, options);

  const { delete: deleteApi } = useApiCall();
  const {
    showDialog,
    closeDialog,
    handleDelete,
    loading: deleteLoading,
  } = useDeleteDialog();

  const onDelete = async (id, name) => {
    const result = await handleDelete(
      () => deleteApi(`${deleteEndpoint}/${id}`),
      name
    );

    if (result?.success) {
      // Remove item from local state
      setData((prev) => prev.filter((item) => item.id !== id));
    }

    return result;
  };

  return {
    // Data table state
    data,
    loading: loading || deleteLoading,
    error,
    pagination,
    filters,

    // Data table actions
    fetchData,
    changePage,
    changePageSize,
    updateSearch,
    updateSort,
    resetFilters,

    // Delete actions
    onDelete,
    showDeleteDialog: showDialog,
    closeDeleteDialog: closeDialog,
  };
};

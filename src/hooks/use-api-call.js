import { useState, useCallback } from "react";

/**
 * Custom hook untuk standardisasi API calls
 * @param {string} baseUrl - Base URL untuk API endpoint
 * @param {Object} options - Konfigurasi tambahan
 */
export const useApiCall = (baseUrl, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // Generic API call function
  const apiCall = useCallback(
    async (endpoint = "", method = "GET", body = null, customOptions = {}) => {
      try {
        setLoading(true);
        setError("");

        const url = baseUrl + endpoint;
        const requestOptions = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...customOptions.headers,
          },
          ...customOptions,
        };

        if (
          body &&
          (method === "POST" || method === "PUT" || method === "PATCH")
        ) {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
          return { success: true, data: result.data };
        } else {
          const errorMessage = result.error || "Terjadi kesalahan";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err) {
        const errorMessage = options.defaultError || "Terjadi kesalahan sistem";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, options.defaultError]
  );

  // Convenience methods
  const get = useCallback(
    (endpoint = "", customOptions = {}) =>
      apiCall(endpoint, "GET", null, customOptions),
    [apiCall]
  );

  const post = useCallback(
    (endpoint = "", body = null, customOptions = {}) =>
      apiCall(endpoint, "POST", body, customOptions),
    [apiCall]
  );

  const put = useCallback(
    (endpoint = "", body = null, customOptions = {}) =>
      apiCall(endpoint, "PUT", body, customOptions),
    [apiCall]
  );

  const del = useCallback(
    (endpoint = "", customOptions = {}) =>
      apiCall(endpoint, "DELETE", null, customOptions),
    [apiCall]
  );

  // Reset function
  const reset = useCallback(() => {
    setData(null);
    setError("");
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    setError,
    get,
    post,
    put,
    delete: del,
    reset,
  };
};

/**
 * Hook khusus untuk data fetching dengan auto-refresh
 */
export const useDataFetch = (endpoint, options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const api = useApiCall(endpoint, options);

  const [refreshCount, setRefreshCount] = useState(0);

  // Fetch data
  const fetchData = useCallback(
    async (customEndpoint = "") => {
      return await api.get(customEndpoint);
    },
    [api]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
    return fetchData();
  }, [fetchData]);

  // Auto refresh functionality
  React.useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    ...api,
    fetchData,
    refresh,
    refreshCount,
  };
};

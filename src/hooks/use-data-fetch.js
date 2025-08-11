import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook untuk standardisasi data fetching
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Konfigurasi fetching
 */
export const useDataFetch = (endpoint, options = {}) => {
  const {
    immediate = true,
    dependencies = [],
    transform = null,
    errorMessage = "Gagal memuat data",
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch data function
  const fetchData = useCallback(
    async (customEndpoint = null) => {
      try {
        setLoading(true);
        setError("");

        const url = customEndpoint || endpoint;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          const finalData = transform ? transform(result.data) : result.data;
          setData(finalData);
          setLastFetch(new Date().toISOString());
          return { success: true, data: finalData };
        } else {
          const errorMsg = result.error || errorMessage;
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        const errorMsg = errorMessage;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, transform, errorMessage]
  );

  // Refresh data
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError("");
    setLastFetch(null);
  }, []);

  // Auto fetch on mount/dependencies change
  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, endpoint, fetchData, JSON.stringify(dependencies)]);

  return {
    data,
    loading,
    error,
    lastFetch,
    fetchData,
    refresh,
    reset,
    setData,
    setError,
  };
};

/**
 * Hook untuk data fetching dengan pagination
 */
export const usePaginatedFetch = (baseEndpoint, options = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    searchable = true,
    sortable = true,
    errorMessage = "Gagal memuat data",
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "",
    sortOrder: "asc",
  });

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", pagination.page.toString());
    params.append("pageSize", pagination.pageSize.toString());
    params.append("limit", pagination.pageSize.toString()); // Also add limit for compatibility

    if (filters.search) {
      params.append("search", filters.search);
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);
    }

    return params.toString();
  }, [pagination.page, pagination.pageSize, filters]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = buildQueryParams();
      const endpoint = `${baseEndpoint}?${queryParams}`;

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        // Support multiple data formats
        let items = result.data;
        let totalItems = 0;
        let totalPages = 1;

        if (result.data.products) {
          // Products API format
          items = result.data.products;
          totalItems = result.data.pagination?.total || items.length;
          totalPages =
            result.data.pagination?.totalPages ||
            Math.ceil(totalItems / pagination.pageSize);
        } else if (result.data.items) {
          // Standard items format
          items = result.data.items;
          totalItems = result.data.totalItems || items.length;
          totalPages =
            result.data.totalPages ||
            Math.ceil(totalItems / pagination.pageSize);
        } else if (Array.isArray(result.data)) {
          // Direct array format
          items = result.data;
          totalItems = items.length;
          totalPages = Math.ceil(totalItems / pagination.pageSize);
        }

        setData(items);
        setPagination((prev) => ({
          ...prev,
          totalItems,
          totalPages,
        }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.error || errorMessage;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = errorMessage;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint, buildQueryParams, errorMessage]);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  }, []);

  // Update search
  const updateSearch = useCallback((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Update sort
  const updateSort = useCallback((sortBy, sortOrder = "asc") => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "asc" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Fetch when dependencies change
  useEffect(() => {
    if (baseEndpoint) {
      fetchData();
    }
  }, [baseEndpoint, fetchData]);

  return {
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
    setError,
  };
};

/**
 * Hook untuk single item fetch (detail pages)
 */
export const useItemFetch = (baseEndpoint, id, options = {}) => {
  const {
    immediate = true,
    errorMessage = "Gagal memuat data",
    notFoundMessage = "Data tidak ditemukan",
  } = options;

  const endpoint = id ? `${baseEndpoint}/${id}` : null;

  const {
    data: item,
    loading,
    error,
    fetchData,
    refresh,
    reset,
    setData: setItem,
    setError,
  } = useDataFetch(endpoint, {
    immediate: immediate && !!id,
    errorMessage,
  });

  // Check if item exists
  const exists = item !== null && item !== undefined;
  const notFound = !loading && !error && !exists && id;

  return {
    item,
    loading,
    error: notFound ? notFoundMessage : error,
    exists,
    notFound,
    fetchItem: fetchData,
    refresh,
    reset,
    setItem,
    setError,
  };
};

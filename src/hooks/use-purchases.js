import { useState, useEffect, useCallback } from "react";

// Hook for fetching purchase orders list with pagination and filters
export const usePurchaseOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    supplier_id: "",
    date_from: "",
    date_to: "",
    ...initialFilters,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await fetch(`/api/purchases/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch purchase orders:", data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const updatePagination = (newPagination) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    refreshOrders,
  };
};

// Hook for fetching single purchase order
export const usePurchaseOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/purchases/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error);
        setOrder(null);
      }
    } catch (err) {
      console.error("Error fetching purchase order:", err);
      setError("Failed to fetch purchase order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const refreshOrder = () => {
    fetchOrder();
  };

  return {
    order,
    loading,
    error,
    refreshOrder,
  };
};

// Hook for purchase order stats/summary
export const usePurchaseStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/purchases/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.error("Failed to fetch purchase stats:", data.error);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching purchase stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    data: stats,
    isLoading: loading,
    refreshStats,
  };
};

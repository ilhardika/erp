import { useState, useEffect } from "react";
import { DEFAULT_PAGINATION } from "@/lib/sales-constants";

/**
 * Custom hook for managing sales orders data fetching and state
 */
export const useSalesOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
    ...DEFAULT_PAGINATION,
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.search) params.append("search", filter.search);
      params.append("page", filter.page.toString());
      params.append("pageSize", filter.pageSize.toString());

      const response = await fetch(`/api/sales/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Error fetching orders: " + err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const response = await fetch(`/api/sales/orders/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchOrders(); // Refresh the list
        return { success: true, message: "Sales order berhasil dihapus" };
      } else {
        return {
          success: false,
          message: data.message || "Gagal menghapus sales order",
        };
      }
    } catch (err) {
      return {
        success: false,
        message: "Terjadi kesalahan saat menghapus sales order",
      };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  return {
    orders,
    loading,
    error,
    filter,
    pagination,
    setFilter,
    fetchOrders,
    deleteOrder,
  };
};

/**
 * Custom hook for managing sales stats
 */
export const useSalesStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/sales/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || "Failed to fetch stats");
      }
    } catch (err) {
      setError("Error fetching stats: " + err.message);
      console.error("Error fetching sales stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Custom hook for managing single sales order
 */
export const useSalesOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sales/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || "Order tidak ditemukan");
      }
    } catch (err) {
      setError("Error fetching order: " + err.message);
      console.error("Error fetching order detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (updateData) => {
    try {
      const response = await fetch(`/api/sales/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrder(data.data);
        return { success: true, message: "Sales order berhasil diupdate" };
      } else {
        return {
          success: false,
          message: data.message || "Gagal mengupdate sales order",
        };
      }
    } catch (err) {
      return {
        success: false,
        message: "Terjadi kesalahan saat mengupdate sales order",
      };
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    updateOrder,
  };
};

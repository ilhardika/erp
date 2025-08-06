"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const productsPerPage = 12;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pos/products/search", {
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setProducts(Array.isArray(result.data) ? result.data : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [
      "all",
      ...new Set(
        Array.isArray(products)
          ? products.map((p) => p.category).filter(Boolean)
          : []
      ),
    ];
    return uniqueCategories;
  }, [products]);

  // Pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / productsPerPage);
  }, [filteredProducts.length, productsPerPage]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [filteredProducts, currentPage, productsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    // Search is handled by filtering in real-time
  }, []);

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const updateSelectedCategory = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  return {
    // State
    products,
    searchQuery,
    selectedCategory,
    currentPage,
    loading,

    // Computed values
    filteredProducts,
    paginatedProducts,
    categories,
    totalPages,
    productsPerPage,

    // Actions
    fetchProducts,
    handleSearch,
    updateSearchQuery,
    updateSelectedCategory,
    goToPage,
  };
}


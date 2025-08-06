"use client";

import { useState, useCallback, useMemo } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const addToCart = useCallback(
    (product, showAlert) => {
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showAlert(
            "Stok Tidak Mencukupi",
            "Jumlah barang di keranjang sudah mencapai batas stok yang tersedia."
          );
          return;
        }
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        if (product.stock === 0) {
          showAlert("Stok Habis", "Produk ini sedang tidak tersedia.");
          return;
        }
        setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
      }
    },
    [cart]
  );

  const updateCartQuantity = useCallback((productId, change, showAlert) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
              return null;
            }
            if (newQuantity > item.stock) {
              showAlert(
                "Stok Tidak Mencukupi",
                "Jumlah yang diminta melebihi stok yang tersedia."
              );
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setTax(0);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return subtotal - discount + tax;
  }, [subtotal, discount, tax]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
    // State
    cart,
    discount,
    tax,

    // Computed values
    subtotal,
    total,
    totalItems,

    // Actions
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setDiscount,
    setTax,
  };
}

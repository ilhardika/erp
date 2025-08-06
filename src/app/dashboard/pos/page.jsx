"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  QrCode,
  Receipt,
} from "lucide-react";
import { formatIDR } from "@/lib/currency";
import ShiftManagement from "@/components/pos/shift-management";
import { useCart } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";
import { useAlerts } from "@/hooks/use-alerts";
import { usePayment } from "@/hooks/use-payment";
import { useShift } from "@/hooks/use-shift";

export default function POSPage() {
  // Mobile UI states
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Custom hooks for state management
  const cart = useCart();
  const products = useProducts();
  const alerts = useAlerts();
  const payment = usePayment();
  const shift = useShift();

  // Auto-set payment amount for non-cash payments
  useEffect(() => {
    payment.autoSetPaymentAmount(cart.total);
  }, [payment.paymentMethod, payment.paymentDialog, cart.total]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now handled by filtering
  };

  // Cart Component
  const CartComponent = ({ isMobile = false }) => (
    <div className={`space-y-4 ${isMobile ? "p-4" : ""}`}>
      {!isMobile && (
        <ShiftManagement
          shift={shift.shift}
          onShiftChange={shift.checkShiftStatus}
        />
      )}

      {/* Cart Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5" />
            Keranjang ({cart.cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              Keranjang kosong
            </p>
          ) : (
            <div
              className={`space-y-2 ${
                isMobile ? "max-h-48" : "max-h-64"
              } overflow-y-auto`}
            >
              {cart.cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 border rounded text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatIDR(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        cart.updateCartQuantity(item.id, -1, alerts.showAlert)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-xs">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        cart.updateCartQuantity(item.id, 1, alerts.showAlert)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cart.removeFromCart(item.id)}
                      className="h-6 w-6 p-0 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      {cart.cart.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">{formatIDR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Diskon:</span>
              <Input
                type="number"
                value={cart.discount}
                onChange={(e) =>
                  cart.setDiscount(parseFloat(e.target.value) || 0)
                }
                className="w-20 h-8 text-right text-sm"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pajak:</span>
              <Input
                type="number"
                value={cart.tax}
                onChange={(e) => cart.setTax(parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-right text-sm"
                min="0"
                placeholder="0"
              />
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">{formatIDR(cart.total)}</span>
            </div>
            <Button
              onClick={() => {
                payment.openPaymentDialog();
                if (isMobile) setShowMobileCart(false);
              }}
              className="w-full mt-4 h-10"
              disabled={cart.cart.length === 0}
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Bayar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const handlePayment = async () => {
    if (cart.cart.length === 0) {
      alerts.showAlert(
        "Keranjang Kosong",
        "Silakan tambahkan produk ke keranjang terlebih dahulu."
      );
      return;
    }

    if (!shift.shift?.active_shift) {
      alerts.showAlert(
        "Shift Belum Dibuka",
        "Silakan buka shift terlebih dahulu sebelum melakukan transaksi."
      );
      return;
    }

    const total = cart.total;
    const received = parseFloat(payment.paymentAmount) || 0;

    if (payment.paymentMethod === "cash" && received < total) {
      alerts.showAlert(
        "Jumlah Bayar Kurang",
        `Jumlah yang dibayar kurang dari total: ${formatIDR(total)}`
      );
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        items: cart.cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        customer_id: payment.customer?.id || null,
        discount_amount: cart.discount,
        tax_amount: cart.tax,
        payment_method: payment.paymentMethod,
        payment_received: received,
        notes: "",
      };

      const response = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (result.success) {
        const changeMessage =
          payment.paymentMethod === "cash"
            ? `Kembalian: ${formatIDR(result.data.payment_change)}`
            : "Pembayaran berhasil diproses";

        alerts.showSuccess(
          "Transaksi Berhasil!",
          `Transaksi berhasil diproses. ${changeMessage}`
        );
        // Reset cart and form
        cart.clearCart();
        payment.resetPaymentState();

        // Force refresh shift data after transaction
        shift.checkShiftStatus();
        products.fetchProducts(); // Refresh products for updated stock
      } else {
        alerts.showAlert("Transaksi Gagal", `Error: ${result.error}`);
      }
    } catch (error) {
      alerts.showAlert(
        "Kesalahan Sistem",
        "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!shift.shift?.active_shift) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto mt-20">
          <ShiftManagement
            shift={shift.shift}
            onShiftChange={shift.checkShiftStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Product Search */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search Bar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5" />
                Cari Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={products.handleSearch} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Scan barcode atau ketik nama produk..."
                    value={products.searchQuery}
                    onChange={(e) => products.updateSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={products.loading} size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {products.categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        products.selectedCategory === category
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => products.updateSelectedCategory(category)}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      {category === "all" ? "Semua" : category}
                    </Button>
                  ))}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                {products.paginatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-xs line-clamp-2 flex-1">
                            {product.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-xs flex-shrink-0"
                          >
                            {product.stock}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {product.code}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatIDR(product.price)}
                        </p>
                        <Button
                          onClick={() => cart.addToCart(product)}
                          size="sm"
                          className="w-full h-8 text-xs"
                          disabled={product.stock === 0}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {products.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      products.goToPage(Math.max(1, products.currentPage - 1))
                    }
                    disabled={products.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {products.currentPage} of {products.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      products.goToPage(
                        Math.min(products.totalPages, products.currentPage + 1)
                      )
                    }
                    disabled={products.currentPage === products.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {products.filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada produk ditemukan</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Shift Management - Show below products on mobile only */}
          <div className="lg:hidden">
            <ShiftManagement
              shift={shift.shift}
              onShiftChange={shift.checkShiftStatus}
            />
          </div>
        </div>

        {/* Right Panel - Cart & Shift (Desktop) */}
        <div className="space-y-4 xl:sticky xl:top-4 xl:h-fit hidden xl:block">
          <CartComponent />
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      <div className="xl:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowMobileCart(true)}
          className="h-14 w-14 rounded-full shadow-lg relative"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5" />
          {cart.cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {cart.cart.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Cart Modal */}
      <Dialog open={showMobileCart} onOpenChange={setShowMobileCart}>
        <DialogContent className="h-[90vh] max-w-sm p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Keranjang ({cart.cart.length})
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <CartComponent isMobile={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={payment.paymentDialog}
        onOpenChange={payment.closePaymentDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-lg font-bold text-blue-800">
                Total: {formatIDR(cart.total)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={
                    payment.paymentMethod === "cash" ? "default" : "outline"
                  }
                  onClick={() => payment.updatePaymentMethod("cash")}
                  className="flex flex-col items-center p-2 h-auto"
                  size="sm"
                >
                  <DollarSign className="w-4 h-4 mb-1" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={
                    payment.paymentMethod === "transfer" ? "default" : "outline"
                  }
                  onClick={() => payment.updatePaymentMethod("transfer")}
                  className="flex flex-col items-center p-2 h-auto"
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span className="text-xs">Transfer</span>
                </Button>
                <Button
                  variant={
                    payment.paymentMethod === "qr" ? "default" : "outline"
                  }
                  onClick={() => payment.updatePaymentMethod("qr")}
                  className="flex flex-col items-center p-2 h-auto"
                  size="sm"
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <span className="text-xs">QR</span>
                </Button>
              </div>
            </div>

            {payment.paymentMethod === "cash" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jumlah Bayar
                </label>
                <Input
                  type="number"
                  value={payment.paymentAmount}
                  onChange={(e) => payment.updatePaymentAmount(e.target.value)}
                  placeholder="Masukkan jumlah bayar"
                  min={cart.total}
                  className="text-lg"
                />
                {payment.paymentAmount && payment.paymentMethod === "cash" && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    Kembalian:{" "}
                    {formatIDR(parseFloat(payment.paymentAmount) - cart.total)}
                  </p>
                )}
              </div>
            )}

            {payment.paymentMethod !== "cash" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jumlah Bayar (Otomatis)
                </label>
                <Input
                  type="number"
                  value={cart.total}
                  disabled
                  className="text-lg bg-gray-100"
                />
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  Pembayaran non-tunai: Jumlah pasti sesuai total
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => payment.closePaymentDialog()}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1"
              >
                <Receipt className="w-4 h-4 mr-2" />
                {loading ? "Memproses..." : "Bayar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alerts.alertDialog.open} onOpenChange={alerts.closeAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {alerts.alertDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{alerts.alertDialog.message}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={alerts.closeAlert} className="flex-1">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={alerts.successDialog.open}
        onOpenChange={alerts.closeSuccess}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              {alerts.successDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{alerts.successDialog.message}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={alerts.closeSuccess} className="flex-1">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


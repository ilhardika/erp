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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Receipt,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatIDR } from "@/lib/currency";

export default function ShiftManagement({ shift, onShiftChange }) {
  const [shiftDialog, setShiftDialog] = useState(false);
  const [action, setAction] = useState("open"); // open or close
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-refresh data setelah transaksi
  useEffect(() => {
    // Refresh data setiap 10 detik untuk memastikan data real-time
    const interval = setInterval(() => {
      if (onShiftChange) {
        onShiftChange();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onShiftChange]);

  // Dialog states for alerts
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    title: "",
    message: "",
  });

  // Helper functions for dialogs
  const showAlert = (title, message) => {
    setAlertDialog({ open: true, title, message });
  };

  const showSuccess = (title, message) => {
    setSuccessDialog({ open: true, title, message });
  };

  const handleShiftAction = async () => {
    if (!notes.trim()) {
      showAlert(
        "Catatan Diperlukan",
        "Catatan wajib diisi untuk membuka/tutup shift."
      );
      return;
    }

    if (action === "open" && !openingCash) {
      showAlert(
        "Kas Awal Diperlukan",
        "Jumlah kas awal wajib diisi untuk membuka shift."
      );
      return;
    }

    if (action === "close" && !closingCash) {
      showAlert(
        "Kas Akhir Diperlukan",
        "Jumlah kas akhir wajib diisi untuk menutup shift."
      );
      return;
    }

    // Validate numeric values to prevent overflow
    const maxAmount = 9999999999999.99; // Max for DECIMAL(15,2): less than 10^13

    if (action === "open") {
      const openingAmount = parseFloat(openingCash) || 0;
      if (openingAmount >= 10000000000000) {
        showAlert(
          "Nilai Terlalu Besar",
          "Kas awal tidak boleh melebihi Rp 9,999,999,999,999.99"
        );
        return;
      }
    }

    if (action === "close") {
      const closingAmount = parseFloat(closingCash) || 0;
      if (closingAmount >= 10000000000000) {
        showAlert(
          "Nilai Terlalu Besar",
          "Kas akhir tidak boleh melebihi Rp 9,999,999,999,999.99"
        );
        return;
      }
    }

    try {
      setLoading(true);

      const requestData = {
        action,
        ...(action === "open" && {
          opening_cash: parseFloat(openingCash) || 0,
        }),
        ...(action === "close" && {
          closing_cash: parseFloat(closingCash) || 0,
        }),
        notes: notes.trim(),
      };

      const response = await fetch("/api/pos/shift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This includes cookies
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        // Force refresh data immediately
        if (onShiftChange) {
          onShiftChange();
          // Double refresh after a short delay to ensure data is updated
          setTimeout(() => {
            onShiftChange();
          }, 1000);
        }
      } else {
        showAlert("Gagal Memproses Shift", `Error: ${result.error}`);
      }
    } catch (error) {
      showAlert(
        "Kesalahan Sistem",
        "Terjadi kesalahan saat memproses shift. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status Shift
            </span>
            <Badge
              variant={shift?.active_shift ? "default" : "secondary"}
              className={shift?.active_shift ? "bg-green-600" : "bg-gray-200 "}
            >
              {shift?.active_shift ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {shift?.active_shift ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shift?.active_shift ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Kasir</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {shift.cashier_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mulai Shift</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(shift.active_shift?.opened_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Kas Awal</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatIDR(shift.active_shift.opening_balance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <p className="font-medium flex items-center gap-1">
                    <Receipt className="w-4 h-4" />
                    {shift.today_stats?.transaction_count || 0} transaksi
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Total Penjualan Hari Ini
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatIDR(shift.today_stats?.total_sales || 0)}
                </p>
              </div>

              {/* Desktop tutup shift button */}
              <div className="hidden lg:block">
                <Button
                  onClick={() => {
                    setAction("close");
                    setShiftDialog(true);
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Tutup Shift
                </Button>
              </div>

              {/* Mobile tutup shift card */}
              <div className="lg:hidden">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Tutup Shift</p>
                      <p className="text-sm text-red-600">
                        Akhiri shift kerja hari ini
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setAction("close");
                        setShiftDialog(true);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Tidak ada shift aktif. Buka shift untuk memulai transaksi.
              </p>
              <Button
                onClick={() => {
                  setAction("open");
                  setShiftDialog(true);
                }}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Buka Shift
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Dialog */}
      <Dialog open={shiftDialog} onOpenChange={setShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "open" ? "Buka Shift" : "Tutup Shift"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {action === "open" ? (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kas Awal
                </label>
                <Input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="Masukkan jumlah kas awal"
                  min="0"
                  max="9999999999999.99"
                  step="0.01"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Ringkasan Shift</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Kas Awal:</span>
                      <span className="float-right font-medium">
                        {formatIDR(shift?.active_shift?.opening_balance || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Penjualan:</span>
                      <span className="float-right font-medium">
                        {formatIDR(shift?.today_stats?.total_sales || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Transaksi:</span>
                      <span className="float-right font-medium">
                        {shift?.today_stats?.transaction_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Durasi:</span>
                      <span className="float-right font-medium">
                        {shift?.active_shift?.opened_at
                          ? Math.round(
                              (new Date() -
                                new Date(shift.active_shift.opened_at)) /
                                (1000 * 60 * 60)
                            ) + " jam"
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kas Akhir (Fisik)
                  </label>
                  <Input
                    type="number"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder="Masukkan jumlah kas fisik"
                    min="0"
                    max="9999999999999.99"
                    step="0.01"
                  />
                  {closingCash &&
                    shift?.active_shift?.opening_balance !== undefined &&
                    shift?.active_shift?.total_sales !== undefined && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          Kas seharusnya:{" "}
                          {formatIDR(
                            (shift.active_shift.opening_balance || 0) +
                              (shift.active_shift.total_sales || 0)
                          )}
                        </p>
                        <p
                          className={`font-medium ${
                            parseFloat(closingCash) ===
                            (shift.active_shift.opening_balance || 0) +
                              (shift.active_shift.total_sales || 0)
                              ? "text-green-600"
                              : parseFloat(closingCash) >
                                (shift.active_shift.opening_balance || 0) +
                                  (shift.active_shift.total_sales || 0)
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Selisih:{" "}
                          {formatIDR(
                            parseFloat(closingCash) -
                              (shift.active_shift.opening_balance || 0) -
                              (shift.active_shift.total_sales || 0)
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan catatan shift..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShiftDialog(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleShiftAction}
                disabled={loading}
                className="flex-1"
              >
                {loading
                  ? "Memproses..."
                  : action === "open"
                  ? "Buka Shift"
                  : "Tutup Shift"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={() =>
          setAlertDialog((prev) => ({ ...prev, open: false }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{alertDialog.title}</DialogTitle>
            <DialogDescription>{alertDialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">{alertDialog.message}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() =>
                setAlertDialog((prev) => ({ ...prev, open: false }))
              }
              variant="outline"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialog.open}
        onOpenChange={() =>
          setSuccessDialog((prev) => ({ ...prev, open: false }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{successDialog.title}</DialogTitle>
            <DialogDescription>{successDialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">{successDialog.message}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() =>
                setSuccessDialog((prev) => ({ ...prev, open: false }))
              }
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Save, Building2 } from "lucide-react";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";
import { useStandardForm, API_ENDPOINTS, VALIDATION_RULES } from "@/hooks";

export default function CreateSupplierPage() {
  // Form validation rules
  const validationRules = {
    name: VALIDATION_RULES.required("Nama supplier"),
    code: VALIDATION_RULES.code("Kode supplier"),
    email: VALIDATION_RULES.email("Email"),
    phone: VALIDATION_RULES.required("Nomor telepon"),
    address: VALIDATION_RULES.required("Alamat"),
  };

  // Use standard form hook
  const {
    formData,
    updateField,
    updateFields,
    generateCode,
    handleSubmit,
    loading,
    error,
    success,
    reset,
  } = useStandardForm({
    endpoint: API_ENDPOINTS.SUPPLIERS,
    redirectPath: "/dashboard/suppliers",
    validationRules,
    autoGenerateCode: true,
    codePrefix: "SUP",
    successMessage: "Supplier berhasil ditambahkan",
    errorMessage: "Gagal menambahkan supplier",
    initialData: {
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      tax_id: "",
      supplier_type: "material",
      payment_terms: "",
      credit_limit: "",
      bank_account: "",
      bank_name: "",
      account_holder: "",
      status: "active",
      notes: "",
    },
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Watch for success/error states
  useEffect(() => {
    if (success) {
      setDialogType("success");
      setDialogMessage("Supplier berhasil ditambahkan!");
      setDialogOpen(true);
    } else if (error) {
      setDialogType("error");
      setDialogMessage(error);
      setDialogOpen(true);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleSelectChange = (name, value) => {
    updateField(name, value);
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Convert numeric fields
    const submitData = {
      ...formData,
      payment_terms: parseInt(formData.payment_terms) || 0,
      credit_limit: parseFloat(formData.credit_limit) || 0,
    };

    await handleSubmit(false); // false = create mode
  };

  // Close dialog handler
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType("");
    setDialogMessage("");
  };

  // Supplier types
  const supplierTypes = [
    { value: "material", label: "Material" },
    { value: "service", label: "Service" },
    { value: "distributor", label: "Distributor" },
    { value: "manufacturer", label: "Manufacturer" },
    { value: "wholesaler", label: "Wholesaler" },
    { value: "retailer", label: "Retailer" },
  ];

  // Form content
  const formContent = (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informasi Dasar
          </CardTitle>
          <CardDescription>Masukkan informasi dasar supplier</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Supplier *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama supplier"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Kode Supplier *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Masukkan kode supplier"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCode}
                disabled={loading}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Masukkan nomor telepon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_type">Tipe Supplier</Label>
            <Select
              value={formData.supplier_type}
              onValueChange={(value) =>
                handleSelectChange("supplier_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe supplier" />
              </SelectTrigger>
              <SelectContent>
                {supplierTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Alamat</CardTitle>
          <CardDescription>Masukkan alamat lengkap supplier</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Alamat *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Masukkan kota"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Kode Pos</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="Masukkan kode pos"
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bisnis</CardTitle>
          <CardDescription>
            Masukkan informasi bisnis dan pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">NPWP</Label>
            <Input
              id="tax_id"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleInputChange}
              placeholder="Masukkan NPWP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">Termin Pembayaran (hari)</Label>
            <Input
              id="payment_terms"
              name="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Limit Kredit</Label>
            <Input
              id="credit_limit"
              name="credit_limit"
              type="number"
              value={formData.credit_limit}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bank</CardTitle>
          <CardDescription>
            Masukkan informasi rekening bank (opsional)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Nama Bank</Label>
            <Input
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              placeholder="Masukkan nama bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_account">Nomor Rekening</Label>
            <Input
              id="bank_account"
              name="bank_account"
              value={formData.bank_account}
              onChange={handleInputChange}
              placeholder="Masukkan nomor rekening"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="account_holder">Nama Pemegang Rekening</Label>
            <Input
              id="account_holder"
              name="account_holder"
              value={formData.account_holder}
              onChange={handleInputChange}
              placeholder="Masukkan nama pemegang rekening"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Masukkan catatan tambahan"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? "Menyimpan..." : "Simpan Supplier"}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <DashboardFormLayout
        title="Tambah Supplier"
        description="Tambahkan supplier baru"
        backLink="/dashboard/suppliers"
      >
        {formContent}
      </DashboardFormLayout>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "Berhasil" : "Gagal"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={closeDialog}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

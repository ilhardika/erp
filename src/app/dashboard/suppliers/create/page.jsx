"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Building2 } from "lucide-react";

export default function CreateSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    notes: "",
  });
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "error" | "success"
  const [dialogMessage, setDialogMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateCode = () => {
    // Generate supplier code: SUP + timestamp
    const timestamp = Date.now().toString().slice(-6);
    const code = `SUP${timestamp}`;
    setFormData((prev) => ({
      ...prev,
      code,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        payment_terms: parseInt(formData.payment_terms) || 0,
        credit_limit: parseFloat(formData.credit_limit) || 0,
      };

      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setDialogType("success");
        setDialogMessage("Supplier berhasil ditambahkan!");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push("/dashboard/suppliers");
        }, 1500);
      } else {
        setDialogType("error");
        setDialogMessage(data.error || "Gagal menambahkan supplier");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat menambahkan supplier");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dialog for error/success */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "Berhasil" : "Terjadi Kesalahan"}
            </DialogTitle>
          </DialogHeader>
          <div
            className={
              dialogType === "error" ? "text-red-700" : "text-green-700"
            }
          >
            {dialogMessage}
          </div>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 items-start xs:items-center mb-6">
          <Link href="/dashboard/suppliers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-2 xs:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold">Tambah Supplier</h1>
            <p className="text-gray-600">
              Tambahkan supplier baru ke dalam sistem
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>Informasi utama supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Kode Supplier *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="SUP001"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCode}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Nama Supplier *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama supplier"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Alamat lengkap supplier"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Kota</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Nama kota"
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_id">NPWP</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bisnis</CardTitle>
              <CardDescription>
                Pengaturan tipe supplier dan pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="supplier_type">Tipe Supplier</Label>
                  <Select
                    value={formData.supplier_type}
                    onValueChange={(value) =>
                      handleSelectChange("supplier_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="service">Jasa</SelectItem>
                      <SelectItem value="goods">Barang</SelectItem>
                      <SelectItem value="equipment">Peralatan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_terms">
                    Termin Pembayaran (Hari)
                  </Label>
                  <Input
                    id="payment_terms"
                    name="payment_terms"
                    type="number"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="credit_limit">Limit Kredit</Label>
                  <Input
                    id="credit_limit"
                    name="credit_limit"
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bank</CardTitle>
              <CardDescription>
                Detail rekening bank untuk pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bank_name">Nama Bank</Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="BCA, Mandiri, BNI, dll"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account">Nomor Rekening</Label>
                  <Input
                    id="bank_account"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="account_holder">Nama Pemegang Rekening</Label>
                  <Input
                    id="account_holder"
                    name="account_holder"
                    value={formData.account_holder}
                    onChange={handleInputChange}
                    placeholder="Nama di rekening bank"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Catatan tambahan tentang supplier"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Supplier
                    </>
                  )}
                </Button>
                <Link href="/dashboard/suppliers">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
}

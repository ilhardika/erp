"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    status: "active",
    notes: "",
  });
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "error" | "success"
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const supplier = data.data;
        setFormData({
          code: supplier.code || "",
          name: supplier.name || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          city: supplier.city || "",
          postal_code: supplier.postal_code || "",
          tax_id: supplier.tax_id || "",
          supplier_type: supplier.supplier_type || "material",
          payment_terms: supplier.payment_terms?.toString() || "",
          credit_limit: supplier.credit_limit?.toString() || "",
          bank_account: supplier.bank_account || "",
          bank_name: supplier.bank_name || "",
          account_holder: supplier.account_holder || "",
          status: supplier.status || "active",
          notes: supplier.notes || "",
        });
      } else {
        setDialogType("error");
        setDialogMessage("Supplier tidak ditemukan");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push("/dashboard/suppliers");
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat memuat supplier");
      setDialogOpen(true);
    } finally {
      setInitialLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        payment_terms: parseInt(formData.payment_terms) || 0,
        credit_limit: parseFloat(formData.credit_limit) || 0,
      };

      const response = await fetch(`/api/suppliers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setDialogType("success");
        setDialogMessage("Supplier berhasil diperbarui!");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push(`/dashboard/suppliers/${params.id}`);
        }, 1500);
      } else {
        setDialogType("error");
        setDialogMessage(data.error || "Gagal memperbarui supplier");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat memperbarui supplier");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500">Memuat supplier...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <Link href={`/dashboard/suppliers/`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-2 xs:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold">Edit Supplier</h1>
            <p className="text-gray-600">
              Update informasi supplier dalam database Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Main Information */}
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Supplier</CardTitle>
                  <CardDescription>
                    Detail dasar tentang supplier Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Kode Supplier *</Label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="SUP001"
                        required
                      />
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Nonaktif</SelectItem>
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
                      <Label htmlFor="account_holder">
                        Nama Pemegang Rekening
                      </Label>
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
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                    <Link href={`/dashboard/suppliers/${params.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        Batal
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

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
import { Save, UserPlus } from "lucide-react";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";

export default function CreateCustomerPage() {
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
    customer_type: "retail",
    credit_limit: "",
    payment_terms: "",
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
    // Generate customer code: CUST + timestamp
    const timestamp = Date.now().toString().slice(-6);
    const code = `CUST${timestamp}`;
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
        credit_limit: parseFloat(formData.credit_limit) || 0,
        payment_terms: parseInt(formData.payment_terms) || 0,
      };

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setDialogType("success");
        setDialogMessage("Customer berhasil ditambahkan!");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push("/dashboard/customers");
        }, 1500);
      } else {
        setDialogType("error");
        setDialogMessage(data.error || "Gagal menambahkan customer");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat menambahkan customer");
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

      <DashboardFormLayout
        title="Tambah Customer Baru"
        description="Tambahkan customer baru ke dalam sistem"
        backLink="/dashboard/customers"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>Informasi utama customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Kode Customer *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="CUST001"
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
                  <Label htmlFor="name">Nama Customer *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama customer"
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
                  placeholder="Alamat lengkap customer"
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
                Pengaturan tipe customer dan kredit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customer_type">Tipe Customer</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) =>
                      handleSelectChange("customer_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Grosir</SelectItem>
                      <SelectItem value="corporate">Korporat</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>

              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Catatan tambahan tentang customer"
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
                      Simpan Customer
                    </>
                  )}
                </Button>
                <Link href="/dashboard/customers">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardFormLayout>
    </>
  );
}

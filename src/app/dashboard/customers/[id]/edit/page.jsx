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
import { Save, Users } from "lucide-react";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";

export default function EditCustomerPage() {
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
    customer_type: "retail",
    credit_limit: "",
    payment_terms: "",
    status: "active",
    notes: "",
  });
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "error" | "success"
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const customer = data.data;
        setFormData({
          code: customer.code || "",
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          postal_code: customer.postal_code || "",
          tax_id: customer.tax_id || "",
          customer_type: customer.customer_type || "retail",
          credit_limit: customer.credit_limit?.toString() || "",
          payment_terms: customer.payment_terms?.toString() || "",
          status: customer.status || "active",
          notes: customer.notes || "",
        });
      } else {
        setDialogType("error");
        setDialogMessage("Customer tidak ditemukan");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push("/dashboard/customers");
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat memuat customer");
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
        credit_limit: parseFloat(formData.credit_limit) || 0,
        payment_terms: parseInt(formData.payment_terms) || 0,
      };

      const response = await fetch(`/api/customers/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/customers");
      } else {
        setDialogType("error");
        setDialogMessage(data.error || "Gagal memperbarui customer");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat memperbarui customer");
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
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500">Memuat customer...</p>
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

      <DashboardFormLayout
        title="Edit Customer"
        description="Update informasi customer dalam database Anda"
        backLink="/dashboard/customers"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-6">
          {/* Main Information */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Customer</CardTitle>
                <CardDescription>
                  Detail dasar tentang customer Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Kode Customer *</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="CUST001"
                      required
                    />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        Simpan Perubahan
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
        </div>
      </DashboardFormLayout>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, User, ArrowLeft } from "lucide-react";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    employee_number: "",
    full_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hire_date: "",
    salary: "",
    commission_rate: "0",
    bank_account: "",
    bank_name: "",
    emergency_contact: "",
    emergency_phone: "",
    address: "",
    city: "",
    postal_code: "",
    is_active: true,
  });

  useEffect(() => {
    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  const fetchEmployee = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/employees/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        const employee = data.success ? data.data.employee : data.employee;

        setFormData({
          employee_number: employee.employee_number || "",
          full_name: employee.full_name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          department: employee.department || "",
          position: employee.position || "",
          hire_date: employee.hire_date ? employee.hire_date.split("T")[0] : "",
          salary: employee.salary || "",
          commission_rate: employee.commission_rate || "0",
          bank_account: employee.bank_account || "",
          bank_name: employee.bank_name || "",
          emergency_contact: employee.emergency_contact || "",
          emergency_phone: employee.emergency_phone || "",
          address: employee.address || "",
          city: employee.city || "",
          postal_code: employee.postal_code || "",
          is_active: employee.is_active !== false,
        });
      } else {
        setError("Karyawan tidak ditemukan");
      }
    } catch (error) {
      setError("Gagal memuat data karyawan");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    setError("");

    try {
      const response = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setDialogOpen(true);
      } else {
        setError(data.error || "Gagal mengupdate karyawan");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengupdate karyawan");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (success) {
      router.push(`/dashboard/employees/${params.id}`);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/employees/${params.id}`)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Karyawan</h1>
            <p className="text-gray-600">Memuat data karyawan...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/employees")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Karyawan</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/employees")}
          className="self-start mb-3 p-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Karyawan</h1>
          <p className="text-gray-600">Update informasi karyawan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Employee Basic Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="employee_number">
                Nomor Karyawan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employee_number"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleInputChange}
                placeholder="EMP001"
                required
              />
            </div>

            <div>
              <Label htmlFor="full_name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Nama lengkap karyawan"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@perusahaan.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>
        </div>

        {/* Department & Position */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Departemen & Posisi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="department">
                Departemen <span className="text-red-500">*</span>
              </Label>
              <Select
                name="department"
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">
                Posisi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Software Developer"
                required
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Detail Kepegawaian</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="hire_date">
                Tanggal Bergabung <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="salary">
                Gaji Pokok <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="8500000"
                required
              />
            </div>

            <div>
              <Label htmlFor="commission_rate">Komisi (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={handleInputChange}
                placeholder="5.00"
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Bank</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bank_name">Nama Bank</Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                placeholder="Bank BCA"
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
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Kontak Darurat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="emergency_contact">Kontak Darurat</Label>
              <Input
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                placeholder="Nama kontak darurat"
              />
            </div>

            <div>
              <Label htmlFor="emergency_phone">Telepon Darurat</Label>
              <Input
                id="emergency_phone"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleInputChange}
                placeholder="081234567890"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Alamat</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Alamat lengkap karyawan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Jakarta"
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
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="is_active">Karyawan Aktif</Label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-initial"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Menyimpan..." : "Update Karyawan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/employees/${params.id}`)}
            disabled={loading}
          >
            Batal
          </Button>
        </div>
      </form>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {success ? "Berhasil!" : "Terjadi Kesalahan"}
            </DialogTitle>
            <DialogDescription>
              {success
                ? "Data karyawan berhasil diupdate!"
                : error || "Gagal mengupdate data karyawan"}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

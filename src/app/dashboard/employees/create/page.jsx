"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Save, UserPlus } from "lucide-react";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";
import { useStandardForm, API_ENDPOINTS, VALIDATION_RULES } from "@/hooks";

export default function CreateEmployeePage() {
  // Form validation rules
  const validationRules = {
    employee_number: VALIDATION_RULES.required("Nomor karyawan"),
    full_name: VALIDATION_RULES.required("Nama lengkap"),
    department: VALIDATION_RULES.required("Departemen"),
    position: VALIDATION_RULES.required("Posisi"),
    hire_date: VALIDATION_RULES.required("Tanggal bergabung"),
    salary: VALIDATION_RULES.numeric("Gaji"),
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
    endpoint: API_ENDPOINTS.EMPLOYEES,
    redirectPath: "/dashboard/employees",
    validationRules,
    autoGenerateCode: true,
    codePrefix: "EMP",
    successMessage: "Karyawan berhasil ditambahkan",
    errorMessage: "Gagal menambahkan karyawan",
    initialData: {
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
    },
  });

  // State untuk users
  const [users, setUsers] = useState([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Generate employee number manually
  const handleGenerateEmployeeNumber = useCallback(() => {
    const timestamp = String(Date.now()).slice(-6);
    const random = Math.random().toString(36).substring(2, 3).toUpperCase();
    const employeeNumber = `EMP${timestamp}${random}`;
    updateField("employee_number", employeeNumber);
  }, [updateField]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const result = await response.json();
          setUsers(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Auto-generate employee number on component mount
  useEffect(() => {
    if (!formData.employee_number) {
      handleGenerateEmployeeNumber();
    }
  }, [formData.employee_number, handleGenerateEmployeeNumber]);

  // Watch for success/error states
  useEffect(() => {
    if (success) {
      setDialogType("success");
      setDialogMessage("Karyawan berhasil ditambahkan!");
      setDialogOpen(true);
    } else if (error) {
      setDialogType("error");
      setDialogMessage(error);
      setDialogOpen(true);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const handleSelectChange = (name, value) => {
    updateField(name, value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogType === "success") {
      reset();
    }
  };

  return (
    <DashboardFormLayout
      title="Tambah Karyawan"
      description="Tambahkan data karyawan baru ke sistem"
      backLink="/dashboard/employees"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Employee Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            <CardDescription>
              Data dasar karyawan dan nomor identifikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_number">
                  Nomor Karyawan <span className="text-red-500">*</span>
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="employee_number"
                    name="employee_number"
                    value={formData.employee_number}
                    onChange={handleInputChange}
                    placeholder="Klik Generate untuk membuat nomor"
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateEmployeeNumber}
                    className="ml-2"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Klik "Generate" untuk membuat nomor karyawan otomatis
                </p>
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
                  placeholder="Masukkan nama lengkap karyawan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contoh@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department & Position */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Departemen & Posisi</CardTitle>
            <CardDescription>
              Informasi jabatan dan departemen karyawan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detail Kepegawaian</CardTitle>
            <CardDescription>
              Informasi gaji, tanggal bergabung, dan komisi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

        {/* Bank Information - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Bank (Opsional)</CardTitle>
            <CardDescription>Data rekening untuk penggajian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Karyawan</CardTitle>
            <CardDescription>
              Status aktif karyawan dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-initial"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Menyimpan..." : "Simpan Karyawan"}
          </Button>
        </div>
      </form>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "Berhasil!" : "Terjadi Kesalahan"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardFormLayout>
  );
}

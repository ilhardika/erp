"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User,
  ArrowLeft,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format-utils";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        const employee = data.success ? data.data.employee : data.employee;
        setEmployee(employee);
      } else {
        setError("Karyawan tidak ditemukan");
      }
    } catch (error) {
      setError("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
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
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Karyawan
            </h1>
            <p className="text-gray-600">Memuat data karyawan...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
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
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Karyawan
            </h1>
            <p className="text-red-600">
              {error || "Karyawan tidak ditemukan"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-col mb-4 sm:mb-0">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/employees")}
            className="self-start mb-3 p-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.full_name || employee.employee_number}
            </h1>
            <p className="text-gray-600">
              {employee.position} - {employee.department}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/employees/${params.id}/edit`)}
          className="w-full sm:w-auto"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Karyawan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Nomor Karyawan</span>
                <p className="font-medium">{employee.employee_number}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Nama Lengkap</span>
                <p className="font-medium">{employee.full_name || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Departemen</span>
                <p className="font-medium">{employee.department || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Posisi</span>
                <p className="font-medium">{employee.position || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tanggal Bergabung</span>
                <p className="font-medium">
                  {employee.hire_date ? formatDate(employee.hire_date) : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <Badge
                  className={`${
                    employee.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status_label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Kontak</h2>
            <div className="space-y-3">
              {employee.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
              )}
              {employee.address && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <p>{employee.address}</p>
                    {(employee.city || employee.postal_code) && (
                      <p className="text-gray-500">
                        {employee.city} {employee.postal_code}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salary & Benefits */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Gaji & Tunjangan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Gaji Pokok</span>
                <p className="font-medium text-lg">
                  {employee.salary ? formatCurrency(employee.salary) : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Komisi</span>
                <p className="font-medium">
                  {employee.commission_rate
                    ? `${(employee.commission_rate * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
              {(employee.bank_name || employee.bank_account) && (
                <>
                  <div>
                    <span className="text-sm text-gray-500">Bank</span>
                    <p className="font-medium">{employee.bank_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Nomor Rekening
                    </span>
                    <p className="font-medium">
                      {employee.bank_account || "-"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {(employee.emergency_contact || employee.emergency_phone) && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Kontak Darurat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Nama</span>
                  <p className="font-medium">
                    {employee.emergency_contact || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Telepon</span>
                  <p className="font-medium">
                    {employee.emergency_phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">
              Ringkasan Absensi (30 Hari)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Hari</span>
                <span className="font-medium">
                  {employee.attendance_summary?.total_days || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Hadir</span>
                <span className="font-medium">
                  {employee.attendance_summary?.present_days || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Tidak Hadir</span>
                <span className="font-medium">
                  {employee.attendance_summary?.absent_days || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-orange-600">Terlambat</span>
                <span className="font-medium">
                  {employee.attendance_summary?.late_days || 0}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Jam Kerja</span>
                  <span className="font-medium">
                    {employee.attendance_summary?.total_hours || 0}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Overtime</span>
                  <span className="font-medium">
                    {employee.attendance_summary?.overtime_hours || 0}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(
                    `/dashboard/attendance?employee_id=${employee.id}`
                  )
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Lihat Absensi
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/dashboard/payroll?employee_id=${employee.id}`)
                }
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Hitung Gaji
              </Button>
            </div>
          </div>

          {/* Account Link */}
          {employee.user_id && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">
                Akun Pengguna
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Karyawan ini terhubung dengan akun:
              </p>
              <p className="font-medium text-blue-900">{employee.email}</p>
              <p className="text-sm text-blue-600">Role: {employee.role}</p>
            </div>
          )}

          {/* Recent Attendance */}
          {employee.recent_attendance &&
            employee.recent_attendance.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Absensi Terbaru</h3>
                <div className="space-y-2">
                  {employee.recent_attendance
                    .slice(0, 5)
                    .map((attendance, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(attendance.attendance_date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attendance.check_in
                              ? new Date(
                                  attendance.check_in
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}{" "}
                            -
                            {attendance.check_out
                              ? new Date(
                                  attendance.check_out
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs ${
                            attendance.status === "present"
                              ? "bg-green-100 text-green-800"
                              : attendance.status === "late"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {attendance.status === "present"
                            ? "Hadir"
                            : attendance.status === "late"
                            ? "Terlambat"
                            : "Tidak Hadir"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

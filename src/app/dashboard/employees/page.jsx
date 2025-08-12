"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import DashboardDataTableLayout from "@/components/layouts/dashboard-datatable-layout";
import { createEmployeeColumns } from "@/components/columns/employee-columns";
import { useStandardDataTable, API_ENDPOINTS } from "@/hooks";

export default function EmployeesPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // Use standardized data table hook
  const {
    data: employees,
    loading,
    error,
    onDelete,
    showDeleteDialog,
    deleteId,
    deleteError,
    handleDeleteClick,
    closeDeleteDialog,
    fetchData: fetchEmployees,
  } = useStandardDataTable(API_ENDPOINTS.EMPLOYEES, {
    pageSize: 20,
    errorMessage: "Gagal memuat data karyawan",
  });

  // Get unique departments and positions for filters
  const departments = [
    ...new Set(employees?.map((emp) => emp.department).filter(Boolean)),
  ];
  const positions = [
    ...new Set(employees?.map((emp) => emp.position).filter(Boolean)),
  ];

  // Columns for data table
  const columns = createEmployeeColumns(handleDeleteClick);

  const confirmDelete = async () => {
    const employee = employees.find((emp) => emp.id === deleteId);
    await onDelete(
      deleteId,
      employee?.full_name || employee?.employee_number || `karyawan ${deleteId}`
    );
  };

  // Filter employees based on selected filters
  const filteredEmployees =
    employees?.filter((employee) => {
      const departmentMatch =
        !selectedDepartment || employee.department === selectedDepartment;
      const statusMatch =
        !selectedStatus ||
        (selectedStatus === "active" && employee.is_active) ||
        (selectedStatus === "inactive" && !employee.is_active);
      const positionMatch =
        !selectedPosition || employee.position === selectedPosition;

      return departmentMatch && statusMatch && positionMatch;
    }) || [];

  // Filter components for conditional filtering
  const filters = [
    <select
      key="department"
      value={selectedDepartment}
      onChange={(e) => setSelectedDepartment(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Departemen</option>
      {departments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>,
    <select
      key="position"
      value={selectedPosition}
      onChange={(e) => setSelectedPosition(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Posisi</option>
      {positions.map((pos) => (
        <option key={pos} value={pos}>
          {pos}
        </option>
      ))}
    </select>,
    <select
      key="status"
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Status</option>
      <option value="active">Aktif</option>
      <option value="inactive">Tidak Aktif</option>
    </select>,
  ];

  return (
    <DashboardDataTableLayout
      title="Data Karyawan"
      description="Kelola data karyawan dan informasi kepegawaian"
      addButtonText="Tambah Karyawan"
      addButtonLink="/dashboard/employees/create"
      data={employees}
      filteredData={filteredEmployees}
      loading={loading}
      columns={columns}
      searchPlaceholder="Cari karyawan..."
      filters={filters}
      emptyStateIcon={Users}
      emptyTitle="Belum ada data karyawan"
      emptyDescription="Tambahkan karyawan pertama untuk memulai pengelolaan SDM"
      emptyActionText="Tambah Karyawan"
      emptyActionLink="/dashboard/employees/create"
      showDeleteDialog={showDeleteDialog}
      onCloseDeleteDialog={closeDeleteDialog}
      onConfirmDelete={confirmDelete}
      deleteTitle="Hapus Karyawan"
      deleteDescription="Apakah Anda yakin ingin menghapus data karyawan ini? Data absensi yang terkait akan tetap tersimpan."
      deleteError={deleteError}
      pageSize={15}
    />
  );
}

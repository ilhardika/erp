"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreVertical, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useRouter } from "next/navigation";

export function createEmployeeColumns(onDeleteClick) {
  const router = useRouter();

  return [
    {
      header: "Nomor Karyawan",
      accessorKey: "employee_number",
      cell: ({ row }) => (
        <div className="font-medium text-blue-600 text-sm">
          {row.original.employee_number}
        </div>
      ),
    },
    {
      header: "Nama Karyawan",
      accessorKey: "full_name",
      cell: ({ row }) => {
        const employee = row.original;
        // Prioritas: data dari user yang di-link, atau fallback ke employee_number
        const displayName =
          employee.full_name || `Karyawan ${employee.employee_number}`;
        const displayEmail = employee.email || "Tidak ada email";

        return (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{displayName}</div>
            <div className="text-xs text-gray-500 truncate">{displayEmail}</div>
          </div>
        );
      },
    },
    {
      header: "Departemen",
      accessorKey: "department",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.department || "-"}</div>
          <div className="text-xs text-gray-500">
            {row.original.position || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Gaji",
      accessorKey: "salary",
      cell: ({ row }) => (
        <div className="text-right text-sm">
          <div className="font-medium">
            {row.original.salary ? formatCurrency(row.original.salary) : "-"}
          </div>
          <div className="text-xs text-gray-500">
            Komisi:{" "}
            {row.original.commission_rate
              ? `${(row.original.commission_rate * 100).toFixed(1)}%`
              : "0%"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status_label",
      cell: ({ row }) => (
        <Badge
          className={`text-xs ${
            row.original.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status_label || "Aktif"}
        </Badge>
      ),
    },
    {
      header: "Tanggal Bergabung",
      accessorKey: "hire_date",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {row.original.hire_date ? formatDate(row.original.hire_date) : "-"}
        </div>
      ),
    },
    {
      header: "Aksi",
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/employees/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/employees/${row.original.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteClick(row.original.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

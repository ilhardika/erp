"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const createCustomerColumns = (handleDeleteClick) => [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="min-w-[200px]">
          <p className="font-medium">{customer.name}</p>
          {customer.email && (
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
              {customer.email}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Kode",
    cell: ({ getValue }) => (
      <div className="min-w-[100px]">
        <code className="bg-gray-100 px-2 py-1 rounded text-sm whitespace-nowrap">
          {getValue()}
        </code>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ getValue }) => (
      <div className="min-w-[120px]">
        <span className="text-gray-600 whitespace-nowrap">
          {getValue() || "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "Kota",
    cell: ({ getValue }) => (
      <div className="min-w-[100px]">
        <span className="text-gray-600 whitespace-nowrap">
          {getValue() || "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "customer_type",
    header: "Tipe",
    cell: ({ getValue }) => {
      const type = getValue();
      const variants = {
        retail: "outline",
        wholesale: "outline",
        corporate: "outline",
      };
      const labels = {
        retail: "Retail",
        wholesale: "Grosir",
        corporate: "Korporat",
      };
      return (
        <div className="min-w-[100px]">
          <Badge
            variant={variants[type] || "secondary"}
            className="whitespace-nowrap"
          >
            {labels[type] || type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <div className="min-w-[80px]">
        <Badge
          variant={getValue() === "active" ? "success" : "danger"}
          className="whitespace-nowrap"
        >
          {getValue() === "active" ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="min-w-[60px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/customers/${customer.id}/edit`}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(customer.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

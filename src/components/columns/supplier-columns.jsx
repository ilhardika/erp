"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export const createSupplierColumns = (handleDeleteClick) => [
  {
    accessorKey: "code",
    header: "Kode",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/suppliers/${row.original.id}`}
        className="font-medium text-blue-600 hover:text-blue-800"
      >
        {row.getValue("code")}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Nama Supplier",
    cell: ({ row }) => {
      const name = row.getValue("name");
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "supplier_type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.getValue("supplier_type");
      const typeLabels = {
        material: "Material",
        service: "Jasa",
        goods: "Barang",
        equipment: "Peralatan",
      };

      const typeVariants = {
        material: "default",
        service: "secondary",
        goods: "outline",
        equipment: "destructive",
      };

      return (
        <Badge variant={typeVariants[type] || "default"}>
          {typeLabels[type] || type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return email ? (
        <div className="text-sm text-gray-600">{email}</div>
      ) : (
        <div className="text-gray-400">-</div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => {
      const phone = row.getValue("phone");
      return phone ? (
        <div className="text-sm">{phone}</div>
      ) : (
        <div className="text-gray-400">-</div>
      );
    },
  },
  {
    accessorKey: "city",
    header: "Kota",
    cell: ({ row }) => {
      const city = row.getValue("city");
      return city ? (
        <div className="text-sm">{city}</div>
      ) : (
        <div className="text-gray-400">-</div>
      );
    },
  },
  {
    accessorKey: "payment_terms",
    header: "Termin",
    cell: ({ row }) => {
      const terms = row.getValue("payment_terms");
      return <div className="text-sm">{terms ? `${terms} hari` : "Cash"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "active" ? "success" : "secondary"}>
          {status === "active" ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/suppliers/${supplier.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(supplier.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, AlertTriangle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatIDR } from "@/lib/currency";

export const createProductColumns = (handleDeleteClick) => [
  {
    accessorKey: "name",
    header: "Produk",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="min-w-[200px]">
          <p className="font-medium">{product.name}</p>
          {product.description && (
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
              {product.description}
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
    accessorKey: "category",
    header: "Kategori",
    cell: ({ getValue }) => (
      <div className="min-w-[100px]">
        <Badge variant="secondary" className="whitespace-nowrap">
          {getValue()}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "supplier_name",
    header: "Supplier",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="min-w-[150px]">
          {product.supplier_name ? (
            <div>
              <p className="font-medium text-sm">{product.supplier_name}</p>
              <p className="text-xs text-gray-500">{product.supplier_code}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">-</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Harga",
    cell: ({ getValue }) => {
      const price = getValue();
      return (
        <div className="min-w-[120px]">
          <p className="font-medium whitespace-nowrap">{formatIDR(price)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: ({ row }) => {
      const product = row.original;
      const getStockStatus = (stock, minStock) => {
        if (stock <= 0) {
          return {
            label: "Habis",
            color: "text-red-600",
            warning: true,
          };
        } else if (stock <= minStock) {
          return {
            label: "Stok Rendah",
            color: "text-yellow-600",
            warning: true,
          };
        }
        return {
          label: "Normal",
          color: "text-green-600",
          warning: false,
        };
      };

      const stockStatus = getStockStatus(product.stock, product.min_stock || 0);

      return (
        <div className="min-w-[100px]">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`font-medium ${stockStatus.color}`}>
              {product.stock}
            </span>
            <span className="text-gray-500 text-sm">{product.unit}</span>
          </div>
          {stockStatus.warning && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 whitespace-nowrap">
                {stockStatus.label}
              </span>
            </div>
          )}
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
      const product = row.original;
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
                  href={`/dashboard/products/${product.id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(product.id)}
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

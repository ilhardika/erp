"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";

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
    accessorKey: "price",
    header: "Harga",
    cell: ({ getValue }) => {
      const price = getValue();
      return (
        <div className="min-w-[120px]">
          <p className="font-medium whitespace-nowrap">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(price)}
          </p>
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
        <div className="flex items-center gap-2 min-w-[140px]">
          <Link href={`/dashboard/products/${product.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(product.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

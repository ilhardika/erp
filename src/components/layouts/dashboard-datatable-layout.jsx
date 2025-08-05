"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";

export default function DashboardDataTableLayout({
  // Header props
  title,
  description,
  addButtonText,
  addButtonLink,

  // Data props
  data = [],
  filteredData = [],
  loading = false,
  columns = [],

  // DataTable props
  searchPlaceholder = "Cari data...",
  filters = [],
  emptyStateIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionText,
  emptyActionLink,
  pageSize = 10,

  // Delete dialog props
  showDeleteDialog = false,
  onCloseDeleteDialog,
  deleteTitle = "Konfirmasi Hapus",
  deleteDescription = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  deleteError = "",
  onConfirmDelete,

  // Optional custom content
  customHeader,
  customCard,
  loadingMessage = "Memuat data...",

  // Card customization
  cardTitle,
  cardDescription,
}) {
  const renderHeader = () => {
    if (customHeader) return customHeader;

    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-gray-500 mt-2">{description}</p>}
        </div>
        {addButtonLink && (
          <Link href={addButtonLink}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </Link>
        )}
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        {EmptyIcon && (
          <EmptyIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {data.length === 0
            ? emptyTitle
            : `${emptyTitle.split(" ")[0]} tidak ditemukan`}
        </h3>
        <p className="text-gray-500 mb-4">
          {data.length === 0
            ? emptyDescription
            : "Coba ubah kriteria pencarian atau filter"}
        </p>
        {data.length === 0 && emptyActionLink && (
          <Link href={emptyActionLink}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {emptyActionText}
            </Button>
          </Link>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">{loadingMessage}</p>
      </div>
    );
  };

  const renderDataTable = () => {
    if (loading) return renderLoadingState();

    return (
      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        emptyMessage={renderEmptyState()}
        pageSize={pageSize}
        showSearch={true}
        showPagination={true}
        enableSorting={true}
        enableFiltering={true}
      />
    );
  };

  const renderCard = () => {
    if (customCard) return customCard;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>
            {cardDescription ||
              `Menampilkan ${filteredData.length} dari ${data.length} data`}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderDataTable()}</CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={onCloseDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{deleteTitle}</DialogTitle>
            </DialogHeader>
            <div className="my-4 text-gray-700">{deleteDescription}</div>
            {deleteError && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={onCloseDeleteDialog}>
                Batal
              </Button>
              <Button variant="destructive" onClick={onConfirmDelete}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Header Section */}
      {renderHeader()}

      {/* Main Content Card */}
      {renderCard()}
    </div>
  );
}

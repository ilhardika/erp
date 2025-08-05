"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

export default function DashboardDetailLayout({
  // Header props
  title,
  subtitle,
  backLink,
  backText = "Kembali",

  // Action props
  editLink,
  editText = "Edit",
  onDelete,
  deleteText = "Hapus",
  showEdit = true,
  showDelete = true,

  // Content props
  children,
  loading = false,
  loadingMessage = "Memuat data...",
  loadingIcon: LoadingIcon,

  // Error props
  error = false,
  errorMessage = "Data tidak ditemukan",
  errorIcon: ErrorIcon,

  // Delete dialog props
  showDeleteDialog = false,
  onCloseDeleteDialog,
  deleteError = "",
  onConfirmDelete,
  deleteTitle = "Konfirmasi Hapus",
  deleteDescription = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",

  // Custom components
  customHeader,
  customActions,

  // Layout props
  containerClassName = "container mx-auto p-6",
  actionsClassName = "flex gap-2",
}) {
  const renderHeader = () => {
    if (customHeader) return customHeader;

    return (
      <div className="mb-6">
        {backLink && (
          <Link href={backLink} className="inline-block mb-3">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {(showEdit || showDelete || customActions) && (
            <div className={actionsClassName}>
              {customActions}
              {showEdit && editLink && (
                <Link href={editLink}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    {editText}
                  </Button>
                </Link>
              )}
              {showDelete && onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            {LoadingIcon && (
              <LoadingIcon className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            )}
            <p className="text-gray-500">{loadingMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderError = () => {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            {ErrorIcon && (
              <ErrorIcon className="h-12 w-12 mx-auto text-red-400 mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {errorMessage}
            </h3>
            <p className="text-gray-500 mb-4">
              Data yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            {backLink && (
              <Link href={backLink}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backText}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    return children;
  };

  return (
    <div className={containerClassName}>
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

      {renderHeader()}
      {renderContent()}
    </div>
  );
}

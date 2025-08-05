import { useState } from "react";

export function useDeleteDialog() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteId(null);
    setDeleteError("");
  };

  const setError = (error) => {
    setDeleteError(error);
  };

  return {
    showDeleteDialog,
    deleteId,
    deleteError,
    handleDeleteClick,
    closeDeleteDialog,
    setDeleteError: setError,
  };
}

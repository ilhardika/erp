import React, { useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import MultiSelectFilter from "./DataTableFilter";

// Status Badge Component
const StatusBadge = ({ status, variant = "default" }) => {
  const variants = {
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant]
      )}
    >
      {status}
    </span>
  );
};

// Action Button Component
const ActionButton = ({
  children,
  variant = "default",
  onClick,
  title,
  className,
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: "text-blue-600 hover:text-blue-900 hover:bg-blue-50",
    success: "text-green-600 hover:text-green-900 hover:bg-green-50",
    danger: "text-red-600 hover:text-red-900 hover:bg-red-50",
    default: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "p-1 rounded transition-colors duration-150",
        disabled ? "opacity-50 cursor-not-allowed" : variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TableActions = ({ children, className }) => {
  return (
    <div
      className={cn("flex items-center justify-center space-x-1", className)}
    >
      {children}
    </div>
  );
};

const DataGrid = ({
  data,
  columns,
  searchTerm = "",
  onSearchChange,
  showSearch = false, // Default false since we have column filters
  pageSize = 10,
  className,
  ...props
}) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(searchTerm);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
  });

  // Update global filter when searchTerm changes
  React.useEffect(() => {
    setGlobalFilter(searchTerm);
  }, [searchTerm]);

  const pageSizeOptions = [5, 10, 25, 50, 100];

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Tampilkan:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">data</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:bg-gray-100"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {{
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted()] ?? "↕"}
                              </span>
                            )}
                          </div>

                          {/* Filter Icon only for multiselect columns */}
                          {header.column.getCanFilter() &&
                            header.column.columnDef.meta?.filterType ===
                              "multiselect" && (
                              <div className="relative">
                                <MultiSelectFilter
                                  options={
                                    header.column.columnDef.meta
                                      ?.filterOptions || []
                                  }
                                  value={header.column.getFilterValue() || []}
                                  onChange={(value) =>
                                    header.column.setFilterValue(value)
                                  }
                                  placeholder="Filter..."
                                  className="w-full"
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tidak ada data ditemukan
                    </h3>
                    <p className="text-sm text-gray-500">
                      Coba ubah filter pencarian atau tambah data baru
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors duration-150 ease-in-out",
                      row.getIsSelected() && "bg-blue-50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <span className="text-sm text-gray-700 px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { DataGrid, StatusBadge, ActionButton, TableActions };

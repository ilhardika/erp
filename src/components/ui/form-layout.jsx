"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function FormLayout({
  title,
  subtitle,
  onBack,
  backTo,
  children,
  actions,
  className = "",
}) {
  return (
    <div className={`space-y-4 p-4 md:p-6 ${className}`}>
      {/* Header with Back Button */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div className="flex items-center space-x-4">
          {(onBack || backTo) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2 w-full sm:w-auto">{actions}</div>
        )}
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}

export function FormSection({ title, children, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      {children}
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormGrid({ columns = 2, gap = 4, children, className = "" }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gridGap = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
}

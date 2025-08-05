"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardFormLayout({
  // Header props
  title,
  description,
  backLink,
  backText = "Kembali",

  // Form props
  children,
  onSubmit,
  loading = false,

  // Custom components
  customHeader,
  customActions,

  // Layout props
  containerClassName = "container mx-auto p-6",
  headerClassName = "flex items-center gap-4 mb-6",
  titleClassName = "text-3xl font-bold",
  descriptionClassName = "text-gray-600",
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
        <div>
          <h1 className={titleClassName}>{title}</h1>
          {description && <p className={descriptionClassName}>{description}</p>}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (onSubmit) {
      return (
        <form onSubmit={onSubmit}>
          {children}
          {customActions}
        </form>
      );
    }

    return (
      <>
        {children}
        {customActions}
      </>
    );
  };

  return (
    <div className={containerClassName}>
      {renderHeader()}
      {renderForm()}
    </div>
  );
}

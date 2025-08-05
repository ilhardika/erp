"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";

export default function CreateSupplierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    email: "",
    phoneNumber: "",
    address: "",
    businessType: "",
    registrationNumber: "",
    taxNumber: "",
    businessLicense: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    branchName: "",
    swiftCode: "",
    currency: "IDR",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowDialog(true);
        setTimeout(() => {
          setShowDialog(false);
          router.push("/dashboard/suppliers");
        }, 2000);
      } else {
        console.error("Failed to create supplier");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                placeholder="Enter business type"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="Enter registration number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">Tax Number</Label>
              <Input
                id="taxNumber"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleInputChange}
                placeholder="Enter tax number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License</Label>
              <Input
                id="businessLicense"
                name="businessLicense"
                value={formData.businessLicense}
                onChange={handleInputChange}
                placeholder="Enter business license"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="Enter account name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                placeholder="Enter branch name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code</Label>
              <Input
                id="swiftCode"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleInputChange}
                placeholder="Enter SWIFT code"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                placeholder="Enter currency"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActions = () => (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/dashboard/suppliers")}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Supplier"}
      </Button>
    </div>
  );

  return (
    <>
      <DashboardFormLayout
        title="Create New Supplier"
        description="Add a new supplier to the system"
        onSubmit={handleSubmit}
        actions={renderActions()}
      >
        {renderFormFields()}
      </DashboardFormLayout>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Supplier has been successfully created!</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

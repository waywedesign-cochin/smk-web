"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// -------------------- Types --------------------

interface AddStudentFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  address: string;

  // Admission Details
  selectedBatchId: string;
  salesperson: string;
  referralInfo: string;
  isFundedAccount: boolean;
  admissionNo: string;

  // Fee Structure
  totalCourseFee: number;
  discount: number;
  advanceAmount: number;
  feeDueMode: string;
  dueDate: string;
  paymentMode: string;
  upiTransactionId: string;

  // Notes
  notes: string;

  // Auto-calculated
  balanceAmount?: number;
}

interface Batch {
  id: string;
  name: string;
  course: { name: string; baseFee: number };
  mode: string;
  location: { name: string };
  slotLimit: number;
  currentCount: number;
  status: string;
}

interface AddStudentFormProps {
  onSubmit: (studentData: AddStudentFormData) => void;
  onCancel: () => void;
}

// -------------------- Component --------------------

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AddStudentFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    selectedBatchId: "",
    salesperson: "",
    referralInfo: "",
    isFundedAccount: false,
    admissionNo: "",
    totalCourseFee: 0,
    discount: 0,
    advanceAmount: 0,
    feeDueMode: "",
    dueDate: "",
    paymentMode: "",
    upiTransactionId: "",
    notes: "",
  });

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Generic input handler
  const handleInputChange = <K extends keyof AddStudentFormData>(
    field: K,
    value: AddStudentFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "totalCourseFee" || field === "discount" || field === "advanceAmount") {
        const finalFee = updated.totalCourseFee - updated.discount;
        updated.balanceAmount = finalFee - updated.advanceAmount;
      }

      return updated;
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>

          {/* Admission Details */}
          <div>
            <h3 className="text-lg font-medium">Admission Details</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                placeholder="Admission No"
                value={formData.admissionNo}
                onChange={(e) => handleInputChange("admissionNo", e.target.value)}
              />
              <Input
                placeholder="Salesperson"
                value={formData.salesperson}
                onChange={(e) => handleInputChange("salesperson", e.target.value)}
              />
              <Input
                placeholder="Referral Info"
                value={formData.referralInfo}
                onChange={(e) => handleInputChange("referralInfo", e.target.value)}
              />
            </div>
          </div>

          {/* Fee Structure */}
          <div>
            <h3 className="text-lg font-medium">Fee Structure</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="number"
                placeholder="Total Course Fee"
                value={formData.totalCourseFee}
                onChange={(e) => handleInputChange("totalCourseFee", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Discount"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Advance Amount"
                value={formData.advanceAmount}
                onChange={(e) => handleInputChange("advanceAmount", Number(e.target.value))}
              />
              <Input
                placeholder="Fee Due Mode"
                value={formData.feeDueMode}
                onChange={(e) => handleInputChange("feeDueMode", e.target.value)}
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
              <Input
                placeholder="Payment Mode"
                value={formData.paymentMode}
                onChange={(e) => handleInputChange("paymentMode", e.target.value)}
              />
              <Input
                placeholder="UPI Transaction ID"
                value={formData.upiTransactionId}
                onChange={(e) => handleInputChange("upiTransactionId", e.target.value)}
              />
              <Input
                readOnly
                placeholder="Balance Amount"
                value={formData.balanceAmount ?? 0}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium">Notes</h3>
            <Textarea
              placeholder="Additional notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentForm;

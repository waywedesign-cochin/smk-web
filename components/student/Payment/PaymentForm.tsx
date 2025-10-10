"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Student, Fee } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentSchema } from "@/lib/validation/paymentSchema";

interface PaymentFormProps {
  student: Student;
  fee?: Fee;
  onSave: (data: PaymentInput) => void;
  onClose: () => void;
}

export interface PaymentInput {
  amount: number;
  mode: string;
  paidAt: Date | null;
  transactionId?: string;
  note?: string;
  feeId: string;
  isAdvance?: boolean;
}

export default function PaymentForm({
  student,
  fee,
  onSave,
  onClose,
}: PaymentFormProps) {
  //const loading = useSelector((state: RootState) => state.payment.loading);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentInput, string>>
  >({});
  const loading = useSelector((state: RootState) => state.payments.loading);
  const [formData, setFormData] = useState<PaymentInput>({
    amount: 0,
    mode: "",
    paidAt: null,
    transactionId: "",
    note: "",
    feeId: fee?.id || "",
    isAdvance: false,
  });

  const handleChange = (
    field: keyof PaymentInput,
    value: PaymentInput[keyof PaymentInput]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate formData using Zod
    const result = PaymentSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof PaymentInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof PaymentInput;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Add Payment for {student.name}</h2>

      {/* Amount */}
      <div className="space-y-1">
        <Label>Amount</Label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange("amount", Number(e.target.value))}
          placeholder="Enter payment amount"
          className={errors.amount ? "border-red-500" : ""}
          required
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount}</p>
        )}
      </div>

      {/* Payment Mode */}
      <div className="space-y-1">
        <Label>Payment Mode</Label>
        <Select
          required
          value={formData.mode}
          onValueChange={(value) => handleChange("mode", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
        {errors.mode && <p className="text-red-500 text-sm">{errors.mode}</p>}
      </div>

      {/* Paid At */}
      <div className="space-y-1">
        <Label>Paid Date (optional)</Label>
        <Input
          type="date"
          required
          value={
            formData.paidAt
              ? new Date(formData.paidAt).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            handleChange(
              "paidAt",
              e.target.value ? new Date(e.target.value) : null
            )
          }
        />
        {errors.paidAt && (
          <p className="text-red-500 text-sm">{errors.paidAt}</p>
        )}
      </div>

      {/* Transaction ID */}
      <div className="space-y-1">
        <Label>Transaction ID (optional)</Label>
        <Input
          value={formData.transactionId}
          onChange={(e) => handleChange("transactionId", e.target.value)}
          placeholder="Enter transaction ID"
        />
        {errors.transactionId && (
          <p className="text-red-500 text-sm">{errors.transactionId}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input
          value={formData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Add a note"
        />
        {errors.note && <p className="text-red-500 text-sm">{errors.note}</p>}
      </div>

      {/* Advance Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="isAdvance"
          checked={formData.isAdvance}
          onCheckedChange={(checked) =>
            handleChange("isAdvance", checked === true)
          }
        />
        <Label htmlFor="isAdvance" className="text-sm">
          Mark as Advance Payment
        </Label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Payment"}
        </Button>
      </div>
    </form>
  );
}

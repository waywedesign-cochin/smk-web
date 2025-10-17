"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Student, Fee, Payment } from "@/lib/types";
import { PaymentSchema } from "@/lib/validation/paymentSchema";

export interface PaymentInput {
  id?: string;
  amount: number;
  mode?: string;
  paidAt?: Date | null;
  transactionId?: string;
  note?: string;
  feeId: string;
  isAdvance?: boolean;
  dueDate?: Date | null;
}

interface PaymentFormProps {
  student: Student;
  fee?: Fee;
  existingPayment?: Payment | null; // 👈 optional for edit mode
  onSave: (data: PaymentInput) => void;
  onUpdate?: (data: PaymentInput) => void;
  onClose: () => void;
}

export default function PaymentForm({
  student,
  fee,
  existingPayment = null,
  onSave,
  onUpdate,
  onClose,
}: PaymentFormProps) {
  const loading = useSelector((state: RootState) => state.payments.submitting);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentInput, string>>
  >({});

  // ✅ Initialize with existing payment if editing
  const [formData, setFormData] = useState<PaymentInput>({
    amount: existingPayment?.amount || 0,
    mode: existingPayment?.mode || "",
    paidAt: existingPayment?.paidAt ? new Date(existingPayment.paidAt) : null,
    transactionId: existingPayment?.transactionId || "",
    note: existingPayment?.note || "",
    feeId: fee?.id || existingPayment?.feeId || "",
    dueDate: existingPayment?.dueDate
      ? new Date(existingPayment.dueDate)
      : null,
    isAdvance: false,
  });

  useEffect(() => {
    if (existingPayment) {
      setFormData({
        amount: existingPayment.amount,
        mode: existingPayment.mode,
        paidAt: existingPayment.paidAt
          ? new Date(existingPayment.paidAt)
          : null,
        transactionId: existingPayment.transactionId || "",
        note: existingPayment.note || "",
        feeId: existingPayment.feeId,
        dueDate: existingPayment.dueDate
          ? new Date(existingPayment.dueDate)
          : null,
        isAdvance: false,
      });
    }
  }, [existingPayment]);

  const handleChange = (
    field: keyof PaymentInput,
    value: PaymentInput[keyof PaymentInput]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    if (existingPayment) {
      onUpdate?.({ ...formData, id: existingPayment.id });
    } else {
      onSave(formData);
    }
  };

  const isEditMode = !!existingPayment;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
          disabled={loading}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount}</p>
        )}
      </div>

      {/* Payment Mode */}
      <div className="space-y-1">
        <Label>Payment Mode</Label>
        <Select
          required={existingPayment ? false : true}
          value={formData.mode}
          onValueChange={(value) => handleChange("mode", value)}
          disabled={loading}
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

      {/* Paid Date */}
      <div className="space-y-1">
        <Label>Paid Date</Label>
        <Input
          type="date"
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
          required={existingPayment ? false : true}
          disabled={loading}
        />
        {errors.paidAt && (
          <p className="text-red-500 text-sm">{"Paid Date is required"}</p>
        )}
      </div>
      {existingPayment?.dueDate && (
        <div className="space-y-1">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={
              formData.dueDate
                ? new Date(formData.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              handleChange(
                "dueDate",
                e.target.value ? new Date(e.target.value) : null
              )
            }
            required
            disabled={loading}
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm">{errors.paidAt}</p>
          )}
        </div>
      )}
      {/* Transaction ID */}
      <div className="space-y-1">
        <Label>Transaction ID (optional)</Label>
        <Input
          value={formData.transactionId}
          onChange={(e) => handleChange("transactionId", e.target.value)}
          placeholder="Enter transaction ID"
          disabled={loading}
        />
      </div>

      {/* Note */}
      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input
          value={formData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Add a note"
          disabled={loading}
        />
      </div>

      {/* Advance Checkbox */}
      {!existingPayment &&
        !student?.fees?.some(
          (fee) => fee?.advanceAmount && fee.advanceAmount > 0
        ) && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="isAdvance"
              checked={formData.isAdvance}
              onCheckedChange={(checked) =>
                handleChange("isAdvance", checked === true)
              }
              disabled={loading}
            />
            <Label htmlFor="isAdvance" className="text-sm">
              Mark as Advance Payment
            </Label>
          </div>
        )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading
            ? "Saving..."
            : isEditMode
            ? "Update Payment"
            : "Add Payment"}
        </Button>
      </div>
    </form>
  );
}

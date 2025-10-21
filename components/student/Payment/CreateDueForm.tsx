"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { duePaymentSchema } from "@/lib/validation/paymentSchema";

export interface DueInput {
  id?: string;
  feeId: string;
  amount: string | number;
  dueDate: Date | null;
  note?: string;
}

interface CreateDueFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DueInput) => void;
  defaultFeeId?: string;
  initialData?: Partial<DueInput>;
}

const CreateDueForm: React.FC<CreateDueFormProps> = ({
  open,
  onClose,
  onSave,
  defaultFeeId,
  initialData,
}) => {
  const loading = useAppSelector((state) => state.payments.submitting);

  const [form, setForm] = useState<DueInput>({
    feeId: defaultFeeId || "",
    id: initialData?.id || "",
    amount: initialData?.amount?.toString() || "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
    note: initialData?.note || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DueInput, string>>>(
    {}
  );

  // Reset form when initialData changes
  useEffect(() => {
    setForm({
      id: initialData?.id || "",
      feeId: initialData?.feeId || defaultFeeId || "",
      amount: initialData?.amount || "",
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
      note: initialData?.note || "",
    });
    setErrors({});
  }, [initialData, defaultFeeId]);

  // Reset errors when dialog closes
  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  const handleChange = (
    field: keyof DueInput,
    value: string | number | Date | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse amount to number
    const parsedForm = {
      ...form,
      amount: Number(form.amount),
    };

    const result = duePaymentSchema.safeParse(parsedForm);

    if (!result.success) {
      const newErrors: Partial<Record<keyof DueInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof DueInput;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(parsedForm);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Payment Due" : "Create Payment Due"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="Enter due amount"
              required
              disabled={loading}
            />
            {errors.amount && (
              <p className="text-destructive text-sm">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={
                form.dueDate ? form.dueDate.toISOString().split("T")[0] : ""
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
              <p className="text-destructive text-sm">Due Date is required</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Note (optional)</Label>
            <Input
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Add a note"
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-2 cursor-pointer">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" className="cursor-pointer" disabled={loading}>
              {loading
                ? "Saving..."
                : initialData
                ? "Update Due"
                : "Create Due"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDueForm;

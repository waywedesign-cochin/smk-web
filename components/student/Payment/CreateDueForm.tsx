"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/lib/hooks";
import { duePaymentSchema } from "@/lib/validation/paymentSchema";

interface CreateDueFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DueInput) => void;
  defaultFeeId?: string;
}

export interface DueInput {
  feeId: string;
  amount: number;
  dueDate: Date | null;
  note?: string;
}

const CreateDueForm: React.FC<CreateDueFormProps> = ({
  open,
  onClose,
  onSave,
  defaultFeeId,
}) => {
  const loading = useAppSelector((state) => state.payments.submitting);
  const [form, setForm] = useState<DueInput>({
    feeId: defaultFeeId || "",
    amount: 0,
    dueDate: null,
    note: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DueInput, string>>>(
    {}
  );
  const handleChange = (
    field: keyof DueInput,
    value: string | number | Date | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = duePaymentSchema.safeParse(form);
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
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payment Due</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              onChange={(e) => handleChange("amount", Number(e.target.value))}
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
              <p className="text-destructive text-sm">
                {"Due Date is required"}
              </p>
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
        </div>

        <DialogFooter className="pt-2 cursor-pointer">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="cursor-pointer">
            {loading ? "Saving..." : "Create Due"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDueForm;

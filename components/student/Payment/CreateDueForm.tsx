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
import { set } from "lodash";

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    await onSave(parsedForm);
    setForm({
      id: initialData?.id || "",
      feeId: initialData?.feeId || defaultFeeId || "",
      amount: initialData?.amount || "",
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
      note: initialData?.note || "",
    });
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0E1628] text-gray-200 border border-white/10 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialData ? "Edit Payment Due" : "Create Payment Due"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Amount */}
          <div>
            <label className="text-sm mb-1 block">Amount *</label>
            <Input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="Enter due amount"
              className="bg-[#1B2437] border border-gray-600 text-white"
              disabled={loading}
            />
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm mb-1 block">Due Date *</label>
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
              className="bg-[#1B2437] border border-gray-600 text-white input-date-dark"
              disabled={loading}
            />
            {errors.dueDate && (
              <p className="text-red-400 text-xs mt-1">Due Date is required</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-sm mb-1 block">Note (optional)</label>
            <Input
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Add a note"
              className="bg-[#1B2437] border border-gray-600 text-white"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <DialogFooter className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
              disabled={loading}
            >
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

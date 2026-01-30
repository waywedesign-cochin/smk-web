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
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBankAccounts } from "@/redux/features/bank/bankSlice";

export interface PaymentInput {
  id?: string;
  amount: string | number;
  mode?: string;
  paidAt?: Date | null;
  transactionId?: string;
  note?: string;
  feeId: string;
  bankAccountId?: string;
  isAdvance?: boolean;
  dueDate?: Date | null;
}

interface PaymentFormProps {
  student: Student;
  fee?: Fee;
  existingPayment?: Payment | null;
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
  const dispatch = useAppDispatch();
  const loading = useSelector((state: RootState) => state.payments.submitting);
  const { bankAccounts, loading: bankLoading } = useAppSelector(
    (state) => state.bank
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentInput, string>>
  >({});

  // ✅ Initialize with existing payment if editing
  const [formData, setFormData] = useState<PaymentInput>({
    amount: existingPayment?.amount || "",
    mode: existingPayment?.mode || "",
    paidAt: existingPayment?.paidAt ? new Date(existingPayment.paidAt) : null,
    transactionId: existingPayment?.transactionId || "",
    note: existingPayment?.note || "",
    feeId: fee?.id || existingPayment?.feeId || "",
    bankAccountId: existingPayment?.bankTransaction?.bankAccountId || "",
    dueDate: existingPayment?.dueDate
      ? new Date(existingPayment.dueDate)
      : null,
    isAdvance: student?.fees?.some(
      (fee) => fee.advanceAmount && fee.advanceAmount > 0
    )
      ? false
      : true,
  });

  useEffect(() => {
    // console.log(existingPayment);

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
        bankAccountId: existingPayment.bankTransaction?.bankAccountId || "",
        dueDate: existingPayment.dueDate
          ? new Date(existingPayment.dueDate)
          : null,
        isAdvance: false,
      });
    }
  }, [existingPayment]);

  //get bank accounts
  const getBankAccounts = () => {
    dispatch(fetchBankAccounts());
  };

  useEffect(() => {
    getBankAccounts();
  }, [formData.mode]);

  const handleChange = (
    field: keyof PaymentInput,
    value: PaymentInput[keyof PaymentInput]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // clear only that field's error
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse amount to number
    const parsedForm = {
      ...formData,
      amount: Number(formData.amount),
    };
    const result = PaymentSchema.safeParse(parsedForm);
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
      onUpdate?.({ ...parsedForm, id: existingPayment.id });
    } else {
      onSave(parsedForm);
    }
  };

  const isEditMode = !!existingPayment;
  const hasAdvance =
    (fee?.advanceAmount && fee.advanceAmount > 0) ||
    student?.fees?.some((f) => f.advanceAmount && f.advanceAmount > 0);

  return (
    <div className="w-full mx-auto rounded-xl p-6 bg-[#0E1628] text-gray-200 border border-white/10 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div>
          <label className="text-sm mb-1 block">Amount *</label>
          <Input
            type="number"
            className="bg-[#1B2437] border border-gray-600 text-white"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            placeholder="Enter payment amount"
            disabled={loading}
          />
          {errors.amount && (
            <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Payment Mode */}
        <div>
          <label className="text-sm mb-1 block">Payment Mode *</label>
          <Select
            value={formData.mode}
            onValueChange={(value) => handleChange("mode", value)}
            disabled={
              loading ||
              (!!existingPayment &&
                (existingPayment.mode === "CASH" ||
                  existingPayment.mode === "DIRECTOR"))
            }
          >
            <SelectTrigger className="bg-[#1B2437] border border-gray-600 text-white">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent className="bg-[#1B2437] text-white text-xs">
              <SelectItem value="RAZORPAY">Razorpay</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              {existingPayment?.mode === "CASH" && (
                <SelectItem value="CASH">Cash</SelectItem>
              )}
              {existingPayment?.mode === "DIRECTOR" && (
                <SelectItem value="DIRECTOR">Director</SelectItem>
              )}
            </SelectContent>
          </Select>

          {errors.mode && (
            <p className="text-red-400 text-xs mt-1">{errors.mode}</p>
          )}
        </div>

        {/* Bank Account */}
        {formData.mode && (
          <div>
            <label className="text-sm mb-1 block">Bank Account</label>

            <Select
              value={formData.bankAccountId}
              onValueChange={(value) => handleChange("bankAccountId", value)}
              disabled={bankLoading || loading}
            >
              <SelectTrigger className="bg-[#1B2437] border border-gray-600 text-white">
                <SelectValue
                  placeholder={
                    bankLoading
                      ? "Loading bank accounts..."
                      : "Select bank account"
                  }
                />
              </SelectTrigger>

              <SelectContent className="bg-[#1B2437] text-white text-xs">
                {bankLoading ? (
                  <div className="px-3 py-2 text-gray-400">Loading...</div>
                ) : bankAccounts.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400">
                    No bank accounts found
                  </div>
                ) : (
                  bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.bankAccountId && (
              <p className="text-red-400 text-xs mt-1">
                {errors.bankAccountId}
              </p>
            )}
          </div>
        )}

        {/* Paid Date */}
        <div>
          <label className="text-sm mb-1 block">Paid Date *</label>
          <Input
            type="date"
            className="bg-[#1B2437] border border-gray-600 text-white input-date-dark"
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
            disabled={loading}
          />
          {errors.paidAt && (
            <p className="text-red-400 text-xs mt-1">
              {errors.paidAt || "Paid Date is required"}
            </p>
          )}
        </div>

        {/* Due Date (Edit mode only) */}
        {existingPayment?.dueDate && (
          <div>
            <label className="text-sm mb-1 block">Due Date</label>
            <Input
              type="date"
              className="bg-[#1B2437] border border-gray-600 text-white input-date-dark"
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
              disabled={loading}
            />
            {errors.dueDate && (
              <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>
        )}

        {/* Transaction ID */}
        <div>
          <label className="text-sm mb-1 block">Transaction ID</label>
          <Input
            className="bg-[#1B2437] border border-gray-600 text-white"
            value={formData.transactionId}
            onChange={(e) => handleChange("transactionId", e.target.value)}
            placeholder="Enter transaction ID"
            disabled={loading}
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-sm mb-1 block">Note</label>
          <Input
            className="bg-[#1B2437] border border-gray-600 text-white"
            value={formData.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Add a note"
            disabled={loading}
          />
        </div>

        {/* Advance Checkbox */}
        {!hasAdvance && !existingPayment && (
          <div className="flex items-center gap-2 bg-[#1B2437] border border-gray-600 p-3 rounded-lg">
            <Checkbox
              id="isAdvance"
              checked={formData.isAdvance}
              onCheckedChange={(checked) =>
                handleChange("isAdvance", checked === true)
              }
              disabled={loading}
            />
            <label htmlFor="isAdvance" className="text-sm text-gray-300">
              Mark as Advance Payment
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
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
            disabled={loading}
            className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
          >
            {loading
              ? "Saving..."
              : existingPayment
              ? "Update Payment"
              : "Add Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ZodError } from "zod";
import { bankTransactionSchema } from "@/lib/validation/bankTransactionSchemas";
import {
  addBankTransaction,
  updateBankTransaction,
} from "@/redux/features/bankTransactions/bankTransactionSlice";
import { fetchBankAccounts } from "@/redux/features/bank/bankSlice";
import toast from "react-hot-toast";

export interface BankTransactionFormData {
  id?: string;
  transactionDate: Date;
  transactionId?: string;
  amount: number | string;
  description?: string;
  transactionMode: string | "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  category: string | "OTHER_INCOME" | "OTHER_EXPENSE";
  bankAccountId: string;
  locationId: string;
}

interface BankTransactionFormDialogProps {
  open: boolean;
  onClose: () => void;
  locationId: string;
  bankAccounts: { id: string; name: string }[];
  isEdit?: boolean;
  existingData?: Partial<BankTransactionFormData>;
  getTransactions?: () => void;
}

export default function BankTransactionFormDialog({
  open,
  onClose,
  locationId,
  bankAccounts,
  isEdit = false,
  existingData,
  getTransactions = () => {},
}: BankTransactionFormDialogProps) {
  const dispatch = useAppDispatch();
  const bank = useAppSelector((state) => state.bank.bankAccounts);

  const [form, setForm] = useState<BankTransactionFormData>({
    transactionDate: new Date(),
    amount: "",
    transactionId: "",
    description: "",
    transactionMode: "",
    status: "COMPLETED",
    category: "",
    bankAccountId: "",
    locationId,
  });

  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  //populate form in edit mode
  useEffect(() => {
    if (isEdit && existingData) {
      setForm({
        transactionDate: existingData.transactionDate ?? new Date(),
        transactionId: existingData.transactionId ?? "",
        amount: existingData.amount ?? "",
        description: existingData.description ?? "",
        transactionMode: existingData.transactionMode ?? "UPI",
        status: existingData.status ?? "COMPLETED",
        category: existingData.category ?? "",
        bankAccountId: existingData.bankAccountId ?? "",
        locationId: existingData.locationId ?? locationId,
      });
    }
  }, [isEdit, existingData, locationId]);

  //onChange handler

  const setField = <K extends keyof BankTransactionFormData>(
    key: K,
    value: BankTransactionFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  //submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const selectedBank = bank.find((b) => b.id === form.bankAccountId);

    if (
      form.category === "OTHER_EXPENSE" &&
      selectedBank &&
      Number(form.amount) > (selectedBank.balance ?? 0)
    ) {
      setErrors({ amount: "Insufficient bank balance" });
      toast.error("Insufficient bank balance");
      setSubmitting(false);
      return;
    }

    try {
      const parsed = bankTransactionSchema.parse({
        ...form,
        amount: Number(form.amount),
      });

      if (isEdit && existingData?.id) {
        await dispatch(
          updateBankTransaction({ id: existingData.id, ...parsed })
        );
      } else {
        await dispatch(addBankTransaction(parsed));
      }

      await dispatch(fetchBankAccounts());
      await getTransactions();
      onClose();
      setSubmitting(false);
      if (!isEdit) {
        setForm({
          transactionDate: new Date(),
          amount: "",
          transactionId: "",
          description: "",
          transactionMode: "",
          status: "COMPLETED",
          category: "",
          bankAccountId: "",
          locationId,
        });
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Bank Transaction" : "Add Bank Transaction"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Record a bank credit or debit transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start bg-gray-800 border-gray-600 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(form.transactionDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-gray-800 border-gray-600 p-0">
                  <Calendar
                    mode="single"
                    selected={form.transactionDate}
                    onSelect={(d) => d && setField("transactionDate", d)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.transactionDate && (
              <p className="text-sm text-red-500">{errors.transactionDate}</p>
            )}
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label>Bank Account *</Label>
            <Select
              value={form.bankAccountId}
              onValueChange={(v) => setField("bankAccountId", v)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white  w-full">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankAccountId && (
              <p className="text-sm text-red-500">{errors.bankAccountId}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              className="bg-gray-800 border-gray-600"
              value={form.amount}
              placeholder="Enter amount"
              onChange={(e) => setField("amount", e.target.value)}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Mode & Status */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Transaction Mode *</Label>
              <Select
                value={form.transactionMode}
                onValueChange={(v) => setField("transactionMode", v as string)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white  w-full">
                  <SelectValue placeholder="Select transaction mode" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                </SelectContent>
              </Select>
              {errors.transactionMode && (
                <p className="text-sm text-red-500">{errors.transactionMode}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setField("status", v as "PENDING" | "COMPLETED" | "FAILED")
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white  w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status}</p>
              )}
            </div> */}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setField("category", v as string)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white  w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                {isEdit &&
                  (existingData?.category === "STUDENT_PAYMENT" ||
                    existingData?.category === "PAYMENT_TO_DIRECTOR") && (
                    <>
                      <SelectItem value="STUDENT_PAYMENT" disabled>
                        Student Paid
                      </SelectItem>
                      <SelectItem value="PAYMENT_TO_DIRECTOR" disabled>
                        Payment to Director
                      </SelectItem>
                    </>
                  )}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label>Transaction ID</Label>
            <Input
              className="bg-gray-800 border-gray-600"
              value={form.transactionId}
              placeholder="Enter transaction ID (Optional)"
              onChange={(e) => setField("transactionId", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              className="bg-gray-800 border-gray-600 min-h-[80px]"
              value={form.description}
              placeholder="Enter description (Optional)"
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

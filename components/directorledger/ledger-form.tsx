"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addDirectorLedgerEntry,
  DirectorLedgerEntry,
  updateDirectorLedgerEntry,
} from "@/redux/features/directorledger/directorSlice";

interface LedgerFormProps {
  directorId: string;
  entry?: DirectorLedgerEntry | null;
  onSuccess?: () => void;
}

const TRANSACTION_TYPES = [
  { value: "STUDENT_PAID", label: "Student Paid" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
  { value: "OWNER_TAKEN", label: "cash in hand" },
  { value: "INSTITUTION_GAVE_BANK", label: "To Director Bank" },
];

export function LedgerForm({ directorId, entry, onSuccess }: LedgerFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.directorLedger);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    transactionDate: "",
    amount: "",
    transactionType: "STUDENT_PAID" as
      | "STUDENT_PAID"
      | "OTHER_EXPENSE"
      | "OWNER_TAKEN"
      | "INSTITUTION_GAVE_BANK",
    description: "",
    referenceId: "",
    studentId: "",
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        transactionDate: entry.transactionDate.split("T")[0],
        amount: String(entry.amount),
        transactionType: entry.transactionType,
        description: entry.description,
        referenceId: entry.referenceId || "",
        studentId: entry.studentId || "",
      });
    }
  }, [entry]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      directorId,
    };

    if (entry) {
      await dispatch(
        updateDirectorLedgerEntry({
          id: entry.id,
          entry: payload,
        })
      );
      setSuccessMessage("Entry updated successfully!");
    } else {
      await dispatch(
        addDirectorLedgerEntry(
          payload as Omit<
            DirectorLedgerEntry,
            "id" | "debitCredit" | "createdAt" | "updatedAt"
          >
        )
      );
      setSuccessMessage("Entry added successfully!");
    }

    setFormData({
      transactionDate: "",
      amount: "",
      transactionType: "STUDENT_PAID",
      description: "",
      referenceId: "",
      studentId: "",
    });

    setTimeout(() => {
      setSuccessMessage("");
      onSuccess?.();
    }, 2000);
  };

  return (
    <Card className="bg-white">
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Date *
              </label>
              <Input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Amount *
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Type *
              </label>
              <Select
                value={formData.transactionType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    transactionType: value as typeof formData.transactionType,
                  }))
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reference ID
              </label>
              <Input
                type="text"
                name="referenceId"
                value={formData.referenceId}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Student ID
              </label>
              <Input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction description..."
              rows={3}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Saving..." : entry ? "Update Entry" : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

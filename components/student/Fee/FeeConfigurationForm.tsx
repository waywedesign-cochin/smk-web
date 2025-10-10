"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // adjust path if needed
import { Student } from "@/lib/types";
import { FeeSchema, FeeInput } from "@/lib/validation/feeSchema"; // adjust path

interface FeeData {
  id: string;
  totalCourseFee: number;
  discountAmount: number;
  advanceAmount: number;
  finalFee: number;
  balanceAmount: number;
  feePaymentMode: string;
}

export interface FeeSubmission {
  id: string;
  discountAmount?: number;
  feePaymentMode: string;
}

interface FeeConfigurationFormProps {
  student: Student;
  initialConfig?: FeeData;
  onSave: (config: FeeSubmission) => void;
  onClose: () => void;
}

export default function FeeConfigurationForm({
  student,
  initialConfig,
  onSave,
  onClose,
}: FeeConfigurationFormProps) {
  const loading = useSelector((state: RootState) => state.fees.loading);

  const [feeData, setFeeData] = useState<FeeData>({
    id: "",
    totalCourseFee: 0,
    discountAmount: 0,
    advanceAmount: 0,
    finalFee: 0,
    balanceAmount: 0,
    feePaymentMode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FeeInput, string>>>(
    {}
  );

  // Load initial data or latest fee object
  useEffect(() => {
    const existingConfig =
      initialConfig ||
      (student.fees?.length ? student.fees[student.fees.length - 1] : null);

    if (existingConfig) {
      setFeeData({
        id: existingConfig.id ?? "",
        totalCourseFee: existingConfig.totalCourseFee ?? 0,
        discountAmount: existingConfig.discountAmount ?? 0,
        advanceAmount: existingConfig.advanceAmount ?? 0,
        finalFee: existingConfig.finalFee ?? 0,
        balanceAmount: existingConfig.balanceAmount ?? 0,
        feePaymentMode: existingConfig.feePaymentMode ?? "",
      });
    }
  }, [initialConfig, student.fees]);

  const handleInputChange = (field: keyof FeeData, value: string | number) => {
    setFeeData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate fee logic
      const total = Number(updated.totalCourseFee) || 0;
      const discount = Number(updated.discountAmount) || 0;
      const advance = Number(updated.advanceAmount) || 0;

      const finalFee = total - discount;
      const balanceAmount = finalFee - advance;

      return { ...updated, finalFee, balanceAmount };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate discountAmount & feePaymentMode using Zod
    const result = FeeSchema.safeParse({
      discountAmount: feeData.discountAmount,
      feePaymentMode: feeData.feePaymentMode,
    });

    if (!result.success) {
      // collect errors
      const newErrors: Partial<Record<keyof FeeInput, string>> = {};
      result.error.issues.forEach(
        (err: {
          path: (string | number | symbol)[];
          message: string | undefined;
        }) => {
          const field = err.path[0] as keyof FeeInput;
          newErrors[field] = err.message;
        }
      );
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload: FeeSubmission = {
      id: feeData.id,
      discountAmount: feeData.discountAmount,
      feePaymentMode: feeData.feePaymentMode,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Total Fee & Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Course Fee</Label>
          <Input
            type="number"
            value={feeData.totalCourseFee}
            onChange={(e) =>
              handleInputChange("totalCourseFee", Number(e.target.value))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Discount Amount</Label>
          <Input
            type="number"
            value={feeData.discountAmount}
            onChange={(e) =>
              handleInputChange("discountAmount", Number(e.target.value))
            }
          />
          {errors.discountAmount && (
            <p className="text-red-500 text-sm">{errors.discountAmount}</p>
          )}
        </div>
      </div>

      {/* Final Fee Summary */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Final Fee:</span>
          <span className="font-semibold">
            ₹{feeData.finalFee?.toLocaleString() ?? 0}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance Amount:</span>
          <span className="font-semibold">
            ₹{feeData.balanceAmount?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <Label>Fee Payment Mode</Label>
        <Select
          value={feeData.feePaymentMode}
          onValueChange={(value) => handleInputChange("feePaymentMode", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullPayment">Full Payment</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="70/30">70-30 Split</SelectItem>
            <SelectItem value="others">Other Modes</SelectItem>
          </SelectContent>
        </Select>
        {errors.feePaymentMode && (
          <p className="text-red-500 text-sm">{errors.feePaymentMode}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}

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
import { RootState } from "@/redux/store";
import { Student } from "@/lib/types";
import { FeeSchema, FeeInput } from "@/lib/validation/feeSchema";

interface FeeData {
  id: string;
  totalCourseFee: string | number;
  discountAmount: string | number;
  advanceAmount: string | number;
  finalFee: string | number;
  balanceAmount: string | number;
  feePaymentMode: string;
}

export interface FeeSubmission {
  id: string;
  discountAmount?: number;
  totalCourseFee?: number;
  finalFee?: number;
  balanceAmount?: number;
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
    totalCourseFee: "",
    discountAmount: "",
    advanceAmount: "",
    finalFee: "",
    balanceAmount: "",
    feePaymentMode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FeeInput, string>>>(
    {}
  );

  // 🧠 Load initial data
  useEffect(() => {
    const existingConfig =
      initialConfig || (student.fees?.length ? student.fees[0] : null);
    if (existingConfig) {
      setFeeData({
        id: existingConfig.id ?? "",
        totalCourseFee: existingConfig.totalCourseFee ?? "",
        discountAmount: existingConfig.discountAmount ?? "",
        advanceAmount: existingConfig.advanceAmount ?? "",
        finalFee: existingConfig.finalFee ?? "",
        balanceAmount: existingConfig.balanceAmount ?? existingConfig.finalFee,
        feePaymentMode: existingConfig.feePaymentMode ?? "",
      });
    }
  }, [initialConfig, student.fees]);

  // 🧩 Smarter recalculation logic
  const recalculateFee = (updated: FeeData, changedField?: string): FeeData => {
    const totalCourseFee =
      updated.totalCourseFee === "" ? 0 : Number(updated.totalCourseFee);
    const discount =
      updated.discountAmount === "" ? 0 : Number(updated.discountAmount);
    const alreadyPaid =
      student.fees
        ?.find((f) => f.id === updated.id)
        ?.payments?.reduce((sum, p) => sum + (p.paidAt ? p.amount : 0), 0) || 0;

    let finalFee: number;
    let balanceAmount: number;

    // 🎯 Auto-recalculate when discount or total fee changes
    if (
      changedField === "discountAmount" ||
      changedField === "totalCourseFee"
    ) {
      finalFee = totalCourseFee - discount;
    } else {
      // Keep manual entry
      finalFee = updated.finalFee === "" ? 0 : Number(updated.finalFee);
    }

    // Recalculate balance unless user is editing it directly
    if (changedField === "balanceAmount") {
      balanceAmount =
        updated.balanceAmount === "" ? 0 : Number(updated.balanceAmount);
    } else {
      balanceAmount = Math.max(finalFee - alreadyPaid, 0);
    }

    return { ...updated, finalFee, balanceAmount };
  };

  // Handle changes safely (allow empty input)
  const handleInputChange = (field: keyof FeeData, value: string) => {
    setFeeData((prev) => {
      const updated = { ...prev, [field]: value };

      // Only recalc for fee-related fields
      if (
        [
          "totalCourseFee",
          "discountAmount",
          "finalFee",
          "balanceAmount",
        ].includes(field)
      ) {
        return recalculateFee(updated, field);
      }
      return updated;
    });
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(feeData);

    const result = FeeSchema.safeParse({
      discountAmount:
        feeData.discountAmount === "" ? 0 : Number(feeData.discountAmount),
      feePaymentMode: feeData.feePaymentMode,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof FeeInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FeeInput;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const payload: FeeSubmission = {
      id: feeData.id,
      discountAmount:
        feeData.discountAmount === "" ? 0 : Number(feeData.discountAmount),
      totalCourseFee:
        feeData.totalCourseFee === "" ? 0 : Number(feeData.totalCourseFee),
      finalFee: feeData.finalFee === "" ? 0 : Number(feeData.finalFee),
      balanceAmount:
        feeData.balanceAmount === "" ? 0 : Number(feeData.balanceAmount),
      feePaymentMode: feeData.feePaymentMode,
    };

    onSave(payload);
    console.log(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Total Fee & Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Course Fee</Label>
          <Input
            type="text"
            value={feeData.totalCourseFee}
            onChange={(e) =>
              handleInputChange("totalCourseFee", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Discount Amount</Label>
          <Input
            type="text"
            value={feeData.discountAmount}
            onChange={(e) =>
              handleInputChange("discountAmount", e.target.value)
            }
          />
          {errors.discountAmount && (
            <p className="text-red-500 text-sm">{errors.discountAmount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Final Fee</Label>
          <Input
            type="text"
            value={feeData.finalFee}
            onChange={(e) => handleInputChange("finalFee", e.target.value)}
          />
          {errors.finalFee && (
            <p className="text-red-500 text-sm">{errors.finalFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Balance Amount</Label>
          <Input
            type="text"
            value={feeData.balanceAmount}
            onChange={(e) => handleInputChange("balanceAmount", e.target.value)}
          />
          {errors.balanceAmount && (
            <p className="text-red-500 text-sm">{errors.balanceAmount}</p>
          )}
        </div>
      </div>

      {/* Final Fee Summary */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Final Fee:</span>
          <span className="font-semibold">
            ₹
            {feeData.finalFee !== "" && !isNaN(Number(feeData.finalFee))
              ? Number(feeData.finalFee).toLocaleString()
              : 0}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance Amount:</span>
          <span className="font-semibold">
            ₹
            {feeData.balanceAmount !== "" &&
            !isNaN(Number(feeData.balanceAmount))
              ? Number(feeData.balanceAmount).toLocaleString()
              : 0}
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

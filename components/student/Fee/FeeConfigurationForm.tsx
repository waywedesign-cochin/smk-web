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
import { Fee, Student } from "@/lib/types";
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
  initialConfig?: Fee;
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

  // Load initial data
  useEffect(() => {
    const existingConfig = initialConfig
      ? initialConfig
      : student.fees?.length
      ? student.fees[0]
      : null;

    if (existingConfig) {
      setFeeData({
        id: existingConfig.id ?? "",
        totalCourseFee: String(existingConfig.totalCourseFee ?? ""),
        discountAmount: String(existingConfig.discountAmount ?? ""),
        advanceAmount: String(existingConfig.advanceAmount ?? ""),
        finalFee: String(existingConfig.finalFee ?? ""),
        balanceAmount: String(
          existingConfig.balanceAmount ?? existingConfig.finalFee ?? ""
        ),
        feePaymentMode: existingConfig.feePaymentMode ?? "",
      });
    }
  }, [initialConfig, student.fees]);

  // Smart fee recalculation
  const recalculateFee = (updated: FeeData, changedField?: string): FeeData => {
    const total =
      updated.totalCourseFee === "" ? 0 : Number(updated.totalCourseFee);
    const discount =
      updated.discountAmount === "" ? 0 : Number(updated.discountAmount);

    const alreadyPaid =
      student.fees
        ?.find((f) => f.id === updated.id)
        ?.payments?.reduce((sum, p) => sum + (p.paidAt ? p.amount : 0), 0) || 0;

    let finalFee = updated.finalFee; // MUST remain string
    let balanceAmount = updated.balanceAmount; // MUST remain string

    // auto calculate only total/discount
    if (
      changedField === "totalCourseFee" ||
      changedField === "discountAmount"
    ) {
      finalFee = String(Math.max(total - discount, 0)); // KEEP AS STRING
    }

    // allow clearing
    if (changedField === "finalFee") {
      finalFee = updated.finalFee; // DO NOT CONVERT
    }

    if (changedField === "balanceAmount") {
      balanceAmount = updated.balanceAmount; // DO NOT CONVERT
    } else {
      if (finalFee === "") {
        balanceAmount = "";
      } else {
        balanceAmount = String(Math.max(Number(finalFee) - alreadyPaid, 0)); // STRING
      }
    }

    return { ...updated, finalFee, balanceAmount };
  };

  // Handle input change
  const handleInputChange = (field: keyof FeeData, value: string) => {
    // clear error for field
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    setFeeData((prev) => {
      const updated = { ...prev, [field]: value };

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

    const result = FeeSchema.safeParse({
      discountAmount: feeData.discountAmount,
      totalCourseFee: feeData.totalCourseFee,
      finalFee: feeData.finalFee,
      balanceAmount: feeData.balanceAmount,
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
      discountAmount: Number(feeData.discountAmount || 0),
      totalCourseFee: Number(feeData.totalCourseFee || 0),
      finalFee: Number(feeData.finalFee || 0),
      balanceAmount: Number(feeData.balanceAmount || 0),
      feePaymentMode: feeData.feePaymentMode,
    };

    onSave(payload);
  };

  const switched =
    student?.fees?.some(
      (fee) =>
        (fee?.batchHistoryFrom && fee?.batchHistoryFrom.length > 0) ||
        (fee?.batchHistoryTo && fee.batchHistoryTo.length > 0)
    ) || false;

  if (initialConfig && feeData.id === "") {
    return null;
  }

  return (
    <div className="w-full mx-auto rounded-xl p-6 bg-[#0E1628] text-gray-200 border border-white/10 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRID — Total + Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Course Fee */}
          <div>
            <label className="text-sm mb-1 block">Total Course Fee</label>
            <Input
              type="number"
              className="bg-[#1B2437] border border-gray-600 text-white"
              value={feeData.totalCourseFee}
              onChange={(e) =>
                handleInputChange("totalCourseFee", e.target.value)
              }
              disabled
            />
            {errors.totalCourseFee && (
              <p className="text-red-400 text-xs mt-1">
                {errors.totalCourseFee}
              </p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="text-sm mb-1 block">Discount Amount</label>
            <Input
              type="number"
              className="bg-[#1B2437] border border-gray-600 text-white"
              value={feeData.discountAmount}
              onChange={(e) =>
                handleInputChange("discountAmount", e.target.value)
              }
              disabled={loading}
            />
            {errors.discountAmount && (
              <p className="text-red-400 text-xs mt-1">
                {errors.discountAmount}
              </p>
            )}
          </div>
        </div>

        {/* GRID — Final Fee + Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Final Fee */}
          <div>
            <label className="text-sm mb-1 block">Final Fee</label>
            <Input
              type="number"
              className="bg-[#1B2437] border border-gray-600 text-white"
              value={feeData.finalFee}
              onChange={(e) => handleInputChange("finalFee", e.target.value)}
              disabled={!switched || loading}
            />
            {errors.finalFee && (
              <p className="text-red-400 text-xs mt-1">{errors.finalFee}</p>
            )}
          </div>

          {/* Balance Amount */}
          <div>
            <label className="text-sm mb-1 block">Balance Amount</label>
            <Input
              type="number"
              className="bg-[#1B2437] border border-gray-600 text-white"
              value={feeData.balanceAmount}
              onChange={(e) =>
                handleInputChange("balanceAmount", e.target.value)
              }
              disabled={!switched || loading}
            />
            {errors.balanceAmount && (
              <p className="text-red-400 text-xs mt-1">
                {errors.balanceAmount}
              </p>
            )}
          </div>
        </div>

        {/* SUMMARY BOX */}
        <div className="bg-[#1B2437] border border-gray-700 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Final Fee:</span>
            <span className="font-semibold">
              ₹
              {feeData.finalFee !== "" && !isNaN(Number(feeData.finalFee))
                ? Number(feeData.finalFee).toLocaleString()
                : 0}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Balance:</span>
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
        <div>
          <label className="text-sm mb-1 block">Payment Mode</label>
          <Select
            value={feeData.feePaymentMode || undefined}
            onValueChange={(v) => handleInputChange("feePaymentMode", v)}
            disabled={loading}
          >
            <SelectTrigger className="bg-[#1B2437] border border-gray-600 text-white">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>

            <SelectContent className="bg-[#1B2437] text-white text-sm border-gray-600">
              <SelectItem value="fullPayment">Full Payment</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="70/30">70/30 Split</SelectItem>
              <SelectItem value="others">Other Modes</SelectItem>
            </SelectContent>
          </Select>

          {errors.feePaymentMode && (
            <p className="text-red-400 text-xs mt-1">{errors.feePaymentMode}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}

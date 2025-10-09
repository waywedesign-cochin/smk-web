"use client";

import { useState } from "react";
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
import { Student } from "@/lib/types";

interface FeeConfigurationFormProps {
  student: Student;
  initialConfig?: {
    totalCourseFee: number;
    discount: number;
    paidAmount: number;
    finalFee: number;
    balanceAmount: number;
    feeDueMode: string;
    dueDate?: string;
  };
  onSave: (config: {
    totalCourseFee: number;
    discount: number;
    paidAmount: number;
    finalFee: number;
    balanceAmount: number;
    feeDueMode: string;
    dueDate?: string;
  }) => void;
  onClose: () => void;
}

export default function FeeConfigurationForm({
  student,
  initialConfig,
  onSave,
  onClose,
}: FeeConfigurationFormProps) {
  const [config, setConfig] = useState(
    {
      totalCourseFee: 0,
      discount: 0,
      paidAmount: 0,
      finalFee: 0,
      balanceAmount: 0,
      feeDueMode: "",
      dueDate: "",
    }
  );

  const handleInputChange = (field: string, value: unknown) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value };

      // Recalculate final fee and balance
      const finalFee = updated.totalCourseFee - updated.discount;
      updated.finalFee = finalFee;
      updated.balanceAmount = finalFee - updated.paidAmount;

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">
        Configure Fee for {student.name}
      </h2>

      {/* Total Fee and Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Course Fee</Label>
          <Input
            type="number"
            value={config.totalCourseFee}
            onChange={(e) =>
              handleInputChange("totalCourseFee", Number(e.target.value))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Discount Amount</Label>
          <Input
            type="number"
            value={config.discount}
            onChange={(e) =>
              handleInputChange("discount", Number(e.target.value))
            }
          />
        </div>
      </div>

      {/* Final Fee Display */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Final Fee:</span>
          <span className="font-semibold">
            ₹{config.finalFee?.toLocaleString() ?? 0}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance Amount:</span>
          <span className="font-semibold">
            ₹{config.balanceAmount?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <Label>Fee Payment Mode</Label>
        <Select
          value={config.feeDueMode}
          onValueChange={(value) => handleInputChange("feeDueMode", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL">Full Payment (Pay in full)</SelectItem>
            <SelectItem value="WEEKLY">Weekly Installments</SelectItem>
            <SelectItem value="SEVENTY_THIRTY">70-30 Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date (only if not full payment) */}
      {config.feeDueMode && config.feeDueMode !== "FULL" && (
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={config.dueDate || ""}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Configuration</Button>
      </div>
    </form>
  );
}

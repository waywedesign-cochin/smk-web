"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Repeat } from "lucide-react";
import { Batch, Student } from "@/lib/types";
import { useAppSelector } from "@/lib/hooks";

interface Course {
  name: string;
  baseFee: number;
  mode: string;
}

interface Location {
  name: string;
}

interface SwitchBatchFormProps {
  student: Student;
  availableBatches: Batch[];
  onSubmit: (data: { newBatchId: string; reason: string }) => void;
  onClose: () => void;
}

const SwitchBatchForm: React.FC<SwitchBatchFormProps> = ({
  student,
  availableBatches,
  onSubmit,
  onClose,
}) => {
  const loading = useAppSelector((state) => state.students.submitting);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [reason, setReason] = useState("");

  const selectedBatch = useMemo(
    () => availableBatches.find((b) => b.id === selectedBatchId),
    [selectedBatchId, availableBatches]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchId && reason.trim()) {
      onSubmit({ newBatchId: selectedBatchId, reason });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Batch Info */}
      <div className="rounded-lg bg-gradient-to-b from-black/40 to-[#122147]/40 border-none p-4">
        <h4 className="font-medium mb-3">Current Batch</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white">Batch Name:</span>
            <span className="font-medium">{student?.currentBatch?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">Course:</span>
            <span className="text-[10px]  text-white">
              {student?.currentBatch?.course?.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white">Mode:</span>
            <Badge variant="default">
              {student?.currentBatch?.course?.mode}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white">Course Fee:</span>
            <span className="font-medium">
              ₹{student?.currentBatch?.course?.baseFee.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Select New Batch */}
      <div className="space-y-3">
        <Label>Select New Batch</Label>
        <Select
          value={selectedBatchId}
          onValueChange={setSelectedBatchId}
          required
          disabled={loading}
        >
          <SelectTrigger className="border-white/50 w-full !h-16 ">
            <SelectValue placeholder="Choose a batch" />
          </SelectTrigger>
          <SelectContent className="border-white/50  bg-accent-foreground text-gray-50">
            {availableBatches
              .filter((b) => b.id !== student?.currentBatch?.id)
              .map((batch) => (
                <SelectItem key={batch.id} value={batch.id ?? ""}>
                  <div className="flex flex-col justify-start items-start">
                    <span>
                      {batch.name} - {batch?.course?.name}
                    </span>
                    <span className="text-xs text-muted-foreground ">
                      {batch?.course?.mode} • {batch?.location?.name} • ₹
                      {batch?.course?.baseFee.toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fee Impact */}
      {/* {selectedBatch && (
        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Fee Impact Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Fee:</span>
              <span>₹{currentFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Fee:</span>
              <span>₹{newFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground font-medium">
                Fee Difference:
              </span>
              <span
                className={`font-medium ${
                  feeDifference > 0
                    ? "text-red-600"
                    : feeDifference < 0
                    ? "text-green-600"
                    : ""
                }`}
              >
                {feeDifference > 0 ? "+" : ""}₹{feeDifference.toLocaleString()}
              </span>
            </div>
          </div>
          {feeDifference !== 0 && (
            <p className="text-xs text-muted-foreground">
              {feeDifference > 0
                ? "⚠️ Additional payment will be required from the student"
                : "✓ Fee adjustment will be credited to student account"}
            </p>
          )}
        </div>
      )} */}

      {/* Reason for Switch */}
      <div className="space-y-3">
        <Label>Reason for Batch Switch</Label>
        <Textarea
          placeholder="Enter reason for switching batch (e.g., timing conflict, course change, location preference, etc.)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={loading}
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedBatchId || !reason.trim()}>
          <Repeat className="h-4 w-4 mr-2" />
          {loading ? "Switching..." : " Switch Batch"}
        </Button>
      </div>
    </form>
  );
};

export default SwitchBatchForm;

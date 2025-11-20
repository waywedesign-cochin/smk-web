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
import { Repeat } from "lucide-react";
import { Batch, Student } from "@/lib/types";
import { useAppSelector } from "@/lib/hooks";

interface SwitchBatchFormProps {
  student: Student;
  availableBatches: Batch[];
  onSubmit: (data: {
    newBatchId: string;
    reason: string;
    feeAction: string;
  }) => void;
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
  const [feeAction, setFeeAction] = useState(""); // default option

  const selectedBatch = useMemo(
    () => availableBatches.find((b) => b.id === selectedBatchId),
    [selectedBatchId, availableBatches]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchId && reason.trim()) {
      onSubmit({ newBatchId: selectedBatchId, reason, feeAction });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Batch Info */}
      <div className="rounded-lg bg-gradient-to-b from-black/80 to-[#122147]/40 border-none p-4">
        <h4 className="font-medium mb-3">Current Batch</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white">Batch Name:</span>
            <span className="font-medium">{student?.currentBatch?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Course:</span>
            <span className="text-[10px] text-white">
              {student?.currentBatch?.course?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Mode:</span>
            <Badge variant="default">
              {student?.currentBatch?.course?.mode}
            </Badge>
          </div>
          <div className="flex justify-between">
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
          <SelectTrigger className="border-white/80 w-full !h-16">
            <SelectValue placeholder="Choose a batch" />
          </SelectTrigger>
          <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
            {availableBatches
              .filter((b) => b.id !== student?.currentBatch?.id)
              .map((batch) => (
                <SelectItem key={batch.id} value={batch.id ?? ""}>
                  <div className="flex flex-col justify-start items-start">
                    <span>
                      {batch.name} - {batch?.course?.name}
                    </span>
                    <span className="text-xs text-gray-300">
                      {batch?.course?.mode} • {batch?.location?.name} • ₹
                      {batch?.course?.baseFee.toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

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

      {/* Fee Action Select */}
      <div className="space-y-3">
        <Label>Select how you want to manage the fees</Label>
        <Select
          value={feeAction}
          onValueChange={setFeeAction}
          disabled={loading}
          required
        >
          <SelectTrigger className="border-white/80 w-full">
            <SelectValue placeholder="Select fee record action" />
          </SelectTrigger>
          <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
            <SelectItem value="TRANSFER">
              {" "}
              Keep same fees no change (Late switch).
            </SelectItem>
            <SelectItem value="NEW_FEE">
              Create new fee record for new batch (Early switch).
            </SelectItem>
            <SelectItem value="SPLIT">
              Keep current batch fees, apply new fees in new batch
            </SelectItem>
          </SelectContent>
        </Select>
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
        <Button
          className={`${
            !selectedBatchId || !reason.trim()
              ? ""
              : "border border-gray-400 cursor-pointer"
          }`}
          type="submit"
          disabled={
            !selectedBatchId || !reason.trim() || feeAction === "" || loading
          }
        >
          <Repeat className={`${loading && "animate-spin"} h-4 w-4 mr-2`} />
          {loading ? "Switching..." : "Switch Batch"}
        </Button>
      </div>
    </form>
  );
};

export default SwitchBatchForm;

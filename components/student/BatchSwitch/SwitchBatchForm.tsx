"use client";
import React, { useState, useMemo, useEffect } from "react";
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
import { Loader2, Repeat } from "lucide-react";
import { Batch, Student } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { Input } from "../../ui/input";

interface SwitchBatchFormProps {
  student: Student;
  onSubmit: (data: {
    newBatchId: string;
    reason: string;
    feeAction: string;
  }) => void;
  onClose: () => void;

  // ADD THESE
  defaultBatchId?: string;
  defaultReason?: string;
  defaultFeeAction?: string;
}

const SwitchBatchForm: React.FC<SwitchBatchFormProps> = ({
  student,
  onSubmit,
  onClose,
  defaultBatchId,
  defaultReason,
  defaultFeeAction,
}) => {
  const loading = useAppSelector((state) => state.students.submitting);
  const dispatch = useAppDispatch();
  const { batches, loading: batchesLoading } = useAppSelector(
    (state) => state.batches
  );
  const [batchSearch, setBatchSearch] = useState("");
  const [batchDebouncedSearch, setBatchDebouncedSearch] = useState(batchSearch);
  const [selectedBatchId, setSelectedBatchId] = useState(defaultBatchId || "");
  const [reason, setReason] = useState(defaultReason || "");
  const [feeAction, setFeeAction] = useState(defaultFeeAction || "");

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId),
    [selectedBatchId, batches]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchId && reason.trim()) {
      onSubmit({ newBatchId: selectedBatchId, reason, feeAction });
    }
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setBatchDebouncedSearch(batchSearch);
    }, 250);

    return () => clearTimeout(handler);
  }, [batchSearch]);

  useEffect(() => {
    dispatch(
      fetchBatches({
        search: batchDebouncedSearch,
        limit: 25,
        status: "ACTIVE",
      })
    );
  }, [batchDebouncedSearch]);
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
          <SelectTrigger className="border-white/80 w-full h-16 overflow-hidden">
            <div className="flex w-full items-center">
              <span className="truncate w-full text-left">
                {selectedBatch?.name || "Choose a batch"}
              </span>
            </div>
          </SelectTrigger>

          <SelectContent
            //onPointerDown={(e) => e.preventDefault()}
            className="bg-blue-100/10 backdrop-blur-lg text-white text-xs max-h-90 overflow-y-auto w-[var(--radix-select-trigger-width)]"
          >
            {/*  Search Bar (Shadcn Input) */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 sticky top-0 bg-[#1b24377f] z-10 border-b border-gray-700"
            >
              <Input
                placeholder="Search batch..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                className="bg-[#11182751] text-white border border-gray-600 h-8 text-xs"
              />
            </div>

            {/*  All Batches Option */}

            {/* Filtered Batch List (With Search) */}
            {batchesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-xs">
                No batches found
              </div>
            ) : (
              batches
                .filter((b) => b.id !== student?.currentBatch?.id)
                .map((batch) => (
                  <SelectItem
                    key={batch.id}
                    value={batch.id as string}
                    className="text-xs w-full truncate"
                  >
                    {batch.name}{" "}
                    <span className="capitalize">
                      - ({batch.location?.name.toLocaleUpperCase() || "N/A"})
                    </span>
                  </SelectItem>
                ))
            )}
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
              Keep same fees no change (No revenue shift).
            </SelectItem>
            <SelectItem value="NEW_FEE">
              Create new fee record for new batch (Revenue shift).
            </SelectItem>
            <SelectItem value="SPLIT">
              Keep current batch fees, apply new fees in new batch.
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
          {loading
            ? "Switching..."
            : defaultBatchId
            ? "Update Switch"
            : "Switch Batch"}{" "}
        </Button>
      </div>
    </form>
  );
};

export default SwitchBatchForm;

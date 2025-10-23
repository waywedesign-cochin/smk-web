"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SwitchBatchForm from "./SwitchBatchForm";
import { Batch, Student } from "@/lib/types";

interface SwitchBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  availableBatches: Batch[];
  onSubmit: (data: {
    studentId: string;
    fromBatchId: string;
    toBatchId: string;
    changeDate: string;
    reason: string;
    feeAction: string;
  }) => void;
}

const SwitchBatchDialog: React.FC<SwitchBatchDialogProps> = ({
  open,
  onOpenChange,
  student,
  availableBatches,
  onSubmit,
}) => {
  const handleFormSubmit = (data: {
    newBatchId: string;
    reason: string;
    feeAction: string;
  }) => {
    onSubmit({
      studentId: student.id ?? "",
      fromBatchId: student.currentBatch?.id ?? "",
      toBatchId: data.newBatchId,
      changeDate: new Date().toISOString(),
      reason: data.reason,
      feeAction: data.feeAction,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-blue-100/10 backdrop-blur-lg text-white border-none shadow-inner">
        <DialogHeader>
          <DialogTitle>Switch Student Batch</DialogTitle>
          <DialogDescription>
            Move student to a different batch and adjust fees accordingly.
          </DialogDescription>
        </DialogHeader>
        {/* switch batch form */}
        <SwitchBatchForm
          student={student}
          availableBatches={availableBatches ? availableBatches : []}
          onSubmit={handleFormSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SwitchBatchDialog;

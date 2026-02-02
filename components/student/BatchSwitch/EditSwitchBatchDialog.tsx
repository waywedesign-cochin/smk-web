"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SwitchBatchForm from "./SwitchBatchForm";
import { Student } from "@/lib/types";

interface EditBatchSwitchDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student;

  batchHistoryId: string;
  toBatchId: string;
  reason: string;
  feeAction: string;

  onSubmit: (data: {
    studentId: string;
    batchHistoryId: string;
    newToBatchId: string;
    changeDate: string;
    reason: string;
    newFeeAction: string;
  }) => void;
}

export default function EditBatchSwitchDialog({
  open,
  onOpenChange,
  student,
  batchHistoryId,
  toBatchId,
  reason,
  feeAction,
  onSubmit,
}: EditBatchSwitchDialogProps) {
  const handleSubmit = (data: {
    newBatchId: string;
    reason: string;
    feeAction: string;
  }) => {
    onSubmit({
      studentId: student.id!,
      batchHistoryId,
      newToBatchId: data.newBatchId,
      changeDate: new Date().toISOString(),
      reason: data.reason,
      newFeeAction: data.feeAction,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-blue-100/10 backdrop-blur-lg text-white border-none shadow-inner">
        <DialogHeader>
          <DialogTitle>Edit Batch Switch</DialogTitle>
          <DialogDescription>Modify last batch switch</DialogDescription>
        </DialogHeader>

        <SwitchBatchForm
          student={student}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
          defaultBatchId={toBatchId}
          defaultReason={reason}
          defaultFeeAction={feeAction}
        />
      </DialogContent>
    </Dialog>
  );
}

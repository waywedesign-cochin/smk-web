"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LedgerForm } from "./ledger-form";
import { DirectorLedgerEntry } from "@/redux/features/directorledger/directorSlice";

interface EntryDialogProps {
  directorId: string;
  entry?: DirectorLedgerEntry | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: boolean;
}

export function EntryDialog({
  directorId,
  entry,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
  trigger = true,
}: EntryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? externalOnOpenChange! : setInternalOpen;

  const isEdit = !!entry;
  const title = isEdit ? "Edit Entry" : "Add New Entry";
  const description = isEdit
    ? "Update the transaction details below"
    : "Add a new transaction to the director ledger";

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && !isEdit && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LedgerForm
          directorId={directorId}
          entry={entry}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

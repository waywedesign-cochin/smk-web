"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Removed Textarea as bank accounts don't typically use a large text area
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BankAccountFormData, // Changed type name
  bankAccountSchema, // Changed schema name
} from "@/lib/validation/bankAccountSchema"; // Changed import path
import { BankAccount } from "@/lib/types"; // Used BankAccount type
import { useAppSelector } from "@/lib/hooks";

export default function AddEditBankAccount({
  // Changed component name
  isAddDialogOpen,
  setIsAddDialogOpen,
  editingAccount, // Changed prop name
  setEditingAccount, // Changed prop name
  onSubmit,
}: {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingAccount: BankAccount | null; // Changed prop type
  setEditingAccount: React.Dispatch<React.SetStateAction<BankAccount | null>>; // Changed prop type
  onSubmit: (bankAccount: BankAccount, isEdit?: boolean) => void; // Changed function type
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    // Changed type
    resolver: zodResolver(bankAccountSchema), // Changed schema
    defaultValues: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branch: "",
    },
  });
  const { currentUser } = useAppSelector((state) => state.users);

  // Reset when editing or adding new
  useEffect(() => {
    if (editingAccount) {
      // Changed state name
      reset({
        accountName: editingAccount.accountName,
        accountNumber: editingAccount.accountNumber,
        bankName: editingAccount.bankName,
        ifscCode: editingAccount.ifscCode || "",
        branch: editingAccount.branch || "",
      });
    } else {
      reset({
        accountName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        branch: "",
      });
    }
  }, [editingAccount, reset]);

  const submitHandler = (data: BankAccountFormData) => {
    // Changed type
    // Include the ID if editing
    const submitData: BankAccount = editingAccount
      ? {
          ...data,
          id: editingAccount.id,
          ifscCode: editingAccount.ifscCode || "",
          branch: editingAccount.branch || "",
        }
      : {
          id: "",
          ...data,
          ifscCode: data.ifscCode ?? "",
          branch: data.branch ?? "",
        };

    onSubmit(submitData, !!editingAccount); // Changed object passed
    setIsAddDialogOpen(false);
    setEditingAccount(null); // Changed state name
    reset();
  };

  return (
    <div>
      {(currentUser?.role === 1 || currentUser?.role === 3) && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-black border border-white text-white hover:bg-white hover:text-black"
              onClick={() => {
                reset();
                setEditingAccount(null); // Changed state name
              }}
            >
              <Plus className="h-4 w-4 " />
              Add Account
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md bg-[#0a0a0a]/70 backdrop-blur-3xl border-[#191a1a]">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAccount ? "Edit Bank Account" : "Add New Bank Account"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(submitHandler)}
              className="space-y-4 text-white"
            >
              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name *</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., John Doe"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("accountName")}
                />
                {errors.accountName && (
                  <p className="text-sm text-red-500">
                    {errors.accountName.message}
                  </p>
                )}
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., State Bank of India"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("bankName")}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">
                    {errors.bankName.message}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("accountNumber")}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code (Optional)</Label>
                <Input
                  id="ifscCode"
                  placeholder="e.g., SBIN0000123"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("ifscCode")}
                />
                {errors.ifscCode && (
                  <p className="text-sm text-red-500">
                    {errors.ifscCode.message}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch Name (Optional)</Label>
                <Input
                  id="branch"
                  placeholder="e.g., Main Branch, Mumbai"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("branch")}
                />
                {errors.branch && (
                  <p className="text-sm text-red-500">
                    {errors.branch.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingAccount(null); // Changed state name
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? "Update Account" : "Add Account"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

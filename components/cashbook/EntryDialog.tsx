"use client";
import { Button } from "../ui/button";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
interface CashBookFormData {
  date: Date;
  type: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  description: string;
  amount: number;
  debitCredit: "DEBIT" | "CREDIT";
  reference?: string;
  location?: string;
  paymentMode?: "CASH" | "BANK" | "UPI" | "CARD";
}
function EntryDialog({
  showAddEntry,
  setShowAddEntry,
  locationId,
}: {
  showAddEntry: boolean;
  setShowAddEntry: React.Dispatch<React.SetStateAction<boolean>>;
  locationId: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CashBookFormData>({
    defaultValues: {
      date: new Date(),
      type: "STUDENT_PAID",
      debitCredit: "CREDIT",
      paymentMode: "CASH",
    },
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const watchType = watch("type");
  const watchDebitCredit = watch("debitCredit");
  // Auto-set debit/credit based on transaction type
  const handleTypeChange = (
    type: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN"
  ) => {
    setValue("type", type);
    // Students Paid is typically Credit (money coming in)
    // Office Expense and Owner Taken are typically Debit (money going out)
    if (type === "STUDENT_PAID") {
      setValue("debitCredit", "CREDIT");
    } else {
      setValue("debitCredit", "DEBIT");
    }
  };
  return (
    <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Cash Book Entry</DialogTitle>
          <DialogDescription>
            Create a new transaction entry in the cash book
          </DialogDescription>
        </DialogHeader>

        <form
          // onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      <span>
                        {selectedDate.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) setValue("date", date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Select
                value={watchType}
                onValueChange={(value) =>
                  handleTypeChange(value as CashBookFormData["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT_PAID">Students Paid</SelectItem>
                  <SelectItem value="OFFICE_EXPENSE">Office Expense</SelectItem>
                  <SelectItem value="OWNER_TAKEN">Owner Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Debit/Credit */}
          <div className="space-y-2">
            <Label>Entry Type *</Label>
            <RadioGroup
              value={watchDebitCredit}
              onValueChange={(value) =>
                setValue("debitCredit", value as "DEBIT" | "CREDIT")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CREDIT" id="credit" />
                <Label htmlFor="credit" className="cursor-pointer">
                  Credit (Money In)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEBIT" id="debit" />
                <Label htmlFor="debit" className="cursor-pointer">
                  Debit (Money Out)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {watchType === "STUDENT_PAID"
                ? "Student payments are typically Credit entries"
                : "Expenses are typically Debit entries"}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                valueAsNumber: true,
              })}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction details..."
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 3,
                  message: "Description must be at least 3 characters",
                },
              })}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select
                defaultValue="CASH"
                onValueChange={(value) =>
                  setValue(
                    "paymentMode",
                    value as CashBookFormData["paymentMode"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="e.g., TXN123, INV-001"
                {...register("reference")}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select onValueChange={(value) => setValue("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Campus">Main Campus</SelectItem>
                <SelectItem value="Branch 1">Branch 1</SelectItem>
                <SelectItem value="Branch 2">Branch 2</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Card */}
          <Card
            className={
              watchDebitCredit === "CREDIT"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Summary
                  </p>
                  <p className="text-lg">
                    {watchType === "STUDENT_PAID" && "Student Payment"}
                    {watchType === "OFFICE_EXPENSE" && "Office Expense"}
                    {watchType === "OWNER_TAKEN" && "Owner Withdrawal"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {watchDebitCredit === "CREDIT" ? "Money In" : "Money Out"}
                  </p>
                  <p
                    className={`text-2xl ${
                      watchDebitCredit === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {watchDebitCredit === "CREDIT" ? "+" : "-"}₹
                    {watch("amount") || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddEntry(false);
                reset({
                  date: new Date(),
                  type: "STUDENT_PAID",
                  debitCredit: "CREDIT",
                  paymentMode: "CASH",
                  description: "",
                  amount: 0,
                  reference: "",
                  location: "",
                });
                setSelectedDate(new Date());
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EntryDialog;

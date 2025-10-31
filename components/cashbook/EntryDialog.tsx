"use client";
import { Button } from "../ui/button";
import type React from "react";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { format } from "date-fns";
import type { User } from "@/lib/types";
import {
  addCashbookEntry,
  type CashbookEntry,
  fetchCashbookEntries,
  updateCashbookEntry,
} from "@/redux/features/cashbook/cashbookSlice";
import { useCashbookForm } from "@/hooks/useCashbookForm";

interface CashBookFormData {
  transactionDate: Date;
  transactionType: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  description: string;
  amount: number;
  locationId: string;
  referenceId?: string;
  studentId?: string;
  directorId?: string;
}

interface EntryDialogProps {
  showAddEntry: boolean;
  setShowAddEntry: React.Dispatch<React.SetStateAction<boolean>>;
  locationId: string;
  directors: User[];
  isEdit?: boolean;
  existingData?: CashbookEntry | null;
  user: User;
  handleTabChange: Dispatch<SetStateAction<string>>;
}

export default function EntryDialog({
  showAddEntry,
  setShowAddEntry,
  locationId: propLocationId,
  directors,
  isEdit = false,
  existingData,
  handleTabChange,
  user,
}: EntryDialogProps) {
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.locations.locations);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CashBookFormData>({
    defaultValues: {
      transactionDate: new Date(),
      transactionType: "STUDENT_PAID",
      amount: 0,
      locationId: propLocationId,
      description: "",
      referenceId: "",
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const watchType = watch("transactionType");
  const watchLocation = watch("locationId");
  const watchDirectorId = watch("directorId");

  const {
    batches,
    filteredStudents,
    loadingBatches,
    loadingStudents,
    selectedBatchId,
    selectedStudentId,
    setSelectedBatchId,
    setSelectedStudentId,
    resetFormState,
  } = useCashbookForm({
    isOpen: showAddEntry,
    isEdit,
    existingData,
    transactionType: watchType,
    locationId: watchLocation,
  });

  useEffect(() => {
    if (isEdit && existingData) {
      const txDate = existingData.transactionDate
        ? new Date(existingData.transactionDate)
        : new Date();

      reset({
        transactionDate: txDate,
        transactionType: existingData.transactionType,
        description: existingData.description ?? "",
        amount: existingData.amount ?? 0,
        locationId: existingData.locationId,
        referenceId: existingData.referenceId ?? "",
        studentId: existingData.studentId ?? undefined,
        directorId: existingData.directorId ?? undefined,
      });

      setSelectedDate(txDate);

      // Pre-populate batch and student for edit mode
      if (existingData.transactionType === "STUDENT_PAID") {
        const batchId = existingData.student?.currentBatchId;
        if (batchId) {
          setSelectedBatchId(batchId);
          setValue("studentId", existingData.studentId);
          setSelectedStudentId(existingData.studentId);
        }
      }

      // Pre-populate director for edit mode
      if (existingData.transactionType === "OWNER_TAKEN") {
        setValue("directorId", existingData.directorId);
      }
    } else {
      reset({
        transactionDate: new Date(),
        transactionType: "STUDENT_PAID",
        amount: 0,
        description: "",
        locationId: propLocationId,
        referenceId: "",
      });
      setSelectedDate(new Date());
    }
  }, [
    isEdit,
    existingData,
    reset,
    propLocationId,
    setValue,
    setSelectedBatchId,
    setSelectedStudentId,
  ]);

  useEffect(() => {
    if (watchType !== "STUDENT_PAID") {
      setSelectedBatchId(undefined);
      setSelectedStudentId(undefined);
      setValue("studentId", undefined);
    }
    if (watchType !== "OWNER_TAKEN") {
      setValue("directorId", undefined);
    }
  }, [watchType, setValue, setSelectedBatchId, setSelectedStudentId]);

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(undefined);
    setValue("studentId", undefined);
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setValue("studentId", studentId);
  };

  const handleDirectorChange = (directorId: string) => {
    setValue("directorId", directorId);
  };

  const onSubmit = async (data: CashBookFormData) => {
    try {
      const payload = {
        transactionDate: data.transactionDate.toISOString(),
        transactionType: data.transactionType,
        amount: Number(data.amount),
        description: data.description.trim(),
        locationId: data.locationId,
        referenceId: data.referenceId?.trim() || undefined,
        studentId: data.studentId || undefined,
        directorId: data.directorId || undefined,
      };

      if (isEdit && existingData?.id) {
        await dispatch(
          updateCashbookEntry({ id: existingData.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(addCashbookEntry(payload)).unwrap();
      }

      // Refresh the list based on transaction type
      await dispatch(
        fetchCashbookEntries({
          transactionType: payload.transactionType,
          locationId: payload.locationId,
          year: new Date(payload.transactionDate).getFullYear().toString(),
          month: (new Date(payload.transactionDate).getMonth() + 1).toString(),
        })
      );

      // Update active tab
      if (payload.transactionType === "STUDENT_PAID") {
        handleTabChange("students");
      } else if (payload.transactionType === "OWNER_TAKEN") {
        handleTabChange("owner");
      } else if (payload.transactionType === "OFFICE_EXPENSE") {
        handleTabChange("expenses");
      }

      reset({
        transactionDate: new Date(),
        transactionType: "STUDENT_PAID",
        amount: 0,
        description: "",
        locationId: propLocationId,
        referenceId: "",
      });
      setSelectedDate(new Date());
      resetFormState();
      setShowAddEntry(false);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleClose = () => {
    setShowAddEntry(false);
  };

  return (
    <Dialog open={showAddEntry} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Edit Cash Book Entry" : "Add Cash Book Entry"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEdit ? "Update this transaction" : "Create a new transaction"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      if (d) setValue("transactionDate", d);
                    }}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Transaction Type *</Label>
              <Select
                value={watchType}
                onValueChange={(v) =>
                  setValue(
                    "transactionType",
                    v as CashBookFormData["transactionType"]
                  )
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="STUDENT_PAID">Students Paid</SelectItem>
                  <SelectItem value="OFFICE_EXPENSE">Office Expense</SelectItem>
                  <SelectItem value="OWNER_TAKEN">Owner Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location - Only for admin users */}
          {user?.role === 1 && (
            <div className="space-y-2">
              <Label className="text-white">Location *</Label>
              <Select
                value={watchLocation}
                onValueChange={(v) => setValue("locationId", v)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id as string}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Batch Selection - Only for STUDENT_PAID */}
          {watchType === "STUDENT_PAID" && (
            <div className="space-y-2">
              <Label className="text-white">Batch *</Label>
              <Select
                value={selectedBatchId || ""}
                onValueChange={handleBatchChange}
                disabled={loadingBatches || batches.length === 0}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue
                    placeholder={
                      loadingBatches
                        ? "Loading batches..."
                        : batches.length === 0
                        ? "No batches available"
                        : "Select batch"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id as string}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Student Selection - Only for STUDENT_PAID with batch selected */}
          {watchType === "STUDENT_PAID" && selectedBatchId && (
            <div className="space-y-2">
              <Label className="text-white">Student *</Label>
              <Select
                value={selectedStudentId || ""}
                onValueChange={handleStudentChange}
                disabled={loadingStudents || filteredStudents.length === 0}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue
                    placeholder={
                      loadingStudents
                        ? "Loading students..."
                        : filteredStudents.length === 0
                        ? "No students in batch"
                        : "Select student"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id as string}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Director Selection - Only for OWNER_TAKEN */}
          {watchType === "OWNER_TAKEN" && (
            <div className="space-y-2">
              <Label className="text-white">Director *</Label>
              <Select
                value={watchDirectorId || ""}
                onValueChange={handleDirectorChange}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select director" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {directors.map((director) => (
                    <SelectItem key={director.id} value={director.id as string}>
                      {director.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-white">Amount *</Label>
            <Input
              type="number"
              step="0.01"
              className="bg-gray-800 border-gray-600 text-white"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
            />
            {errors.amount && (
              <p className="text-red-400 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              className="bg-gray-800 border-gray-600 text-white min-h-[80px]"
              placeholder="Enter description..."
              {...register("description")}
            />
          </div>

          {/* Reference ID */}
          <div className="space-y-2">
            <Label className="text-white">Reference ID</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Optional reference number"
              {...register("referenceId")}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

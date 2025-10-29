"use client";
import { Button } from "../ui/button";
import React, { useState, useEffect } from "react";
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
import { Card, CardContent } from "../ui/card";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { format } from "date-fns";
import { Student, User } from "@/lib/types";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { fetchStudents } from "@/redux/features/student/studentSlice";
import {
  addCashbookEntry,
  CashbookEntry,
  updateCashbookEntry,
} from "@/redux/features/cashbook/cashbookSlice";

interface CashBookFormData {
  transactionDate: Date;
  transactionType: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  description: string;
  amount: number;
  locationId: string;
  referenceId?: string;
  studentId?: string;
  directorId?: string;
  batchId?: string; // Only for frontend filtering, not sent to backend
}

interface EntryDialogProps {
  showAddEntry: boolean;
  setShowAddEntry: React.Dispatch<React.SetStateAction<boolean>>;
  locationId: string;
  directors: User[];
  isEdit?: boolean;
  existingData?: CashbookEntry;
}

function EntryDialog({
  showAddEntry,
  setShowAddEntry,
  locationId,
  directors,
  isEdit = false,
  existingData,
}: EntryDialogProps) {
  const dispatch = useAppDispatch();
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
      locationId: locationId,
    },
  });

  const user = useAppSelector((state) => state.users.currentUser);
  const locations = useAppSelector((state) => state.locations.locations);
  const { batches } = useAppSelector((state) => state.batches);
  const { students } = useAppSelector((state) => state.students);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const watchType = watch("transactionType");
  const watchLocation = watch("locationId");
  const watchBatch = watch("batchId");

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (isEdit && existingData) {
      const transactionDate = existingData.transactionDate
        ? new Date(existingData.transactionDate)
        : new Date();

      reset({
        transactionDate,
        transactionType: existingData.transactionType,
        description: existingData.description || "",
        amount: existingData.amount || 0,
        locationId: existingData.locationId,
        referenceId: existingData.referenceId || "",
        studentId: existingData.studentId || undefined,
        directorId: existingData.directorId || undefined,
      });
      setSelectedDate(transactionDate);
    }
  }, [isEdit, existingData, reset]);

  // Fetch batches when location changes
  useEffect(() => {
    if (watchType === "STUDENT_PAID" && watchLocation) {
      fetchBatchesByLocation(watchLocation);
    }
  }, [watchType, watchLocation]);

  // Filter students when batch changes
  useEffect(() => {
    if (watchType === "STUDENT_PAID" && watchBatch) {
      const filtered = students.filter(
        (student) => student.currentBatch?.id === watchBatch
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [watchBatch, students, watchType]);

  // Reset fields when transaction type changes
  useEffect(() => {
    if (watchType !== "STUDENT_PAID") {
      setValue("batchId", undefined);
      setValue("studentId", undefined);
      setFilteredStudents([]);
    }
    if (watchType !== "OWNER_TAKEN") {
      setValue("directorId", undefined);
    }
  }, [watchType, setValue]);

  const fetchBatchesByLocation = async (locationId: string) => {
    setLoadingBatches(true);
    try {
      await dispatch(fetchBatches({ location: locationId })).unwrap();
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchStudentsByBatch = async (batchId: string) => {
    setLoadingStudents(true);
    try {
      await dispatch(
        fetchStudents({
          batch: batchId,
          location: watchLocation,
          page: 1,
          limit: 100, // Increase limit to get all students
        })
      ).unwrap();
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const onSubmit = async (data: CashBookFormData) => {
    try {
      // Prepare data for API - remove batchId as it's not needed in backend
      const { batchId, ...submitData } = {
        ...data,
        transactionDate: data.transactionDate.toISOString(),
        amount: Number(data.amount),
        description: data.description.trim(),
        locationId: data.locationId,
        referenceId: data.referenceId?.trim() || undefined,
        studentId: data.studentId || undefined,
        directorId: data.directorId || undefined,
      };

      console.log("Submitting data:", submitData);

      if (isEdit && existingData?.id) {
        // Update existing entry
        await dispatch(
          updateCashbookEntry({
            id: existingData.id,
            data: submitData,
          })
        ).unwrap();

        setShowAddEntry(false);
      } else {
        // Add new entry
        await dispatch(addCashbookEntry(submitData)).unwrap();
        handleReset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error is handled by the thunk with toast
    }
  };

  const handleReset = () => {
    reset({
      transactionDate: new Date(),
      transactionType: "STUDENT_PAID",
      amount: 0,
      description: "",
      locationId: locationId,
    });
    setSelectedDate(new Date());
    setFilteredStudents([]);
  };

  const handleClose = () => {
    setShowAddEntry(false);
    handleReset();
  };

  return (
    <Dialog open={showAddEntry} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Edit Cash Book Entry" : "Add Cash Book Entry"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEdit
              ? "Update this transaction entry"
              : "Create a new transaction entry"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">
                Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      <span>{format(selectedDate, "PPP")}</span>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) setValue("transactionDate", date);
                    }}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
              {errors.transactionDate && (
                <p className="text-xs text-red-400">
                  {errors.transactionDate.message}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label className="text-white">Transaction Type *</Label>
              <Select
                value={watchType}
                onValueChange={(value) =>
                  setValue(
                    "transactionType",
                    value as CashBookFormData["transactionType"]
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

          {/* Location Selection (Admin only) */}
          {user?.role === 1 && (
            <div className="space-y-2">
              <Label className="text-white">Location *</Label>
              <Select
                value={watchLocation}
                onValueChange={(value) => setValue("locationId", value)}
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
              {errors.locationId && (
                <p className="text-xs text-red-400">
                  {errors.locationId.message}
                </p>
              )}
            </div>
          )}

          {/* Student Selection for STUDENT_PAID */}
          {watchType === "STUDENT_PAID" && (
            <div className="space-y-4">
              {/* Batch Selection */}
              <div className="space-y-2">
                <Label className="text-white">Select Batch</Label>
                <Select
                  value={watchBatch}
                  onValueChange={(value) => {
                    setValue("batchId", value);
                    fetchStudentsByBatch(value);
                  }}
                  disabled={loadingBatches || !watchLocation}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    {loadingBatches ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading batches...
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          !watchLocation
                            ? "Select location first"
                            : "Select batch"
                        }
                      />
                    )}
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

              {/* Student Selection */}
              <div className="space-y-2">
                <Label className="text-white">Select Student *</Label>
                <Select
                  value={watch("studentId")}
                  onValueChange={(value) => setValue("studentId", value)}
                  disabled={loadingStudents || !watchBatch}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    {loadingStudents ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading students...
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          !watchBatch ? "Select batch first" : "Select student"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id as string}>
                        {student.name}{" "}
                        {student.currentBatch &&
                          `- ${student.currentBatch.name}`}
                      </SelectItem>
                    ))}
                    {filteredStudents.length === 0 && !loadingStudents && (
                      <SelectItem value="no-students" disabled>
                        No students found in this batch
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-xs text-red-400">
                    {errors.studentId.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Director Selection for OWNER_TAKEN */}
          {watchType === "OWNER_TAKEN" && (
            <div className="space-y-2">
              <Label className="text-white">Select Director *</Label>
              <Select
                value={watch("directorId")}
                onValueChange={(value) => setValue("directorId", value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select director" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  {directors.map((director) => (
                    <SelectItem key={director.id} value={director.id}>
                      {director.username} - {director.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.directorId && (
                <p className="text-xs text-red-400">
                  {errors.directorId.message}
                </p>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Amount (₹) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="1"
              placeholder="0"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 1, message: "Amount must be greater than 0" },
                valueAsNumber: true,
              })}
            />
            {errors.amount && (
              <p className="text-xs text-red-400">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Enter transaction details..."
              rows={3}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 3,
                  message: "Description must be at least 3 characters",
                },
              })}
            />
            {errors.description && (
              <p className="text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceId" className="text-white">
              Reference Number
            </Label>
            <Input
              id="referenceId"
              placeholder="e.g., TXN123, INV-001"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              {...register("referenceId")}
            />
          </div>

          {/* Summary Card */}
          <Card
            className={`border ${
              watchType === "STUDENT_PAID"
                ? "border-green-600 bg-green-900/20"
                : watchType === "OFFICE_EXPENSE"
                ? "border-red-600 bg-red-900/20"
                : "border-yellow-600 bg-yellow-900/20"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Transaction Summary</p>
                  <p className="text-lg font-medium text-white">
                    {watchType === "STUDENT_PAID" && "Student Payment"}
                    {watchType === "OFFICE_EXPENSE" && "Office Expense"}
                    {watchType === "OWNER_TAKEN" && "Owner Withdrawal"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {watchType === "STUDENT_PAID" ? "Money In" : "Money Out"}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      watchType === "STUDENT_PAID"
                        ? "text-green-400"
                        : watchType === "OFFICE_EXPENSE"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {watchType === "STUDENT_PAID" ? "+" : "-"}₹
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
                "Update Entry"
              ) : (
                "Add Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EntryDialog;

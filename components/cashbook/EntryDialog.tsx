"use client";
import { Button } from "../ui/button";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
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
  fetchCashbookEntries,
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
  batchId?: string;
}

interface EntryDialogProps {
  showAddEntry: boolean;
  setShowAddEntry: React.Dispatch<React.SetStateAction<boolean>>;
  locationId: string;
  directors: User[];
  isEdit?: boolean;
  existingData?: CashbookEntry | null;
  onSuccess?: () => void;
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
  // const user = useAppSelector((state) => state.users.currentUser);
  const locations = useAppSelector((state) => state.locations.locations);
  const batches = useAppSelector((state) => state.batches.batches ?? []);
  const students = useAppSelector((state) => state.students.students ?? []);

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
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  console.log("filtered student ", filteredStudents);
  const watchType = watch("transactionType");
  const watchLocation = watch("locationId");
  const watchBatch = watch("batchId");
  const watchStudent = watch("studentId");
  console.log(watchBatch);
  // Track loaded state
  const hasLoadedBatches = useRef(false);
  const hasLoadedStudents = useRef(false);

  /** RESET FETCH FLAGS ON OPEN */
  useEffect(() => {
    if (showAddEntry) {
      hasLoadedBatches.current = false;
      hasLoadedStudents.current = false;
    }
  }, [showAddEntry]);

  /** INITIALIZE FORM */
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
        batchId: existingData.student?.currentBatchId ?? undefined,
      });
      setSelectedDate(txDate);
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
      setFilteredStudents([]);
    }
  }, [isEdit, existingData, reset, propLocationId]);

  /** FETCH BATCHES */
  const loadBatches = useCallback(
    async (locId: string) => {
      if (!showAddEntry || hasLoadedBatches.current || !locId) return;
      if (watchType !== "STUDENT_PAID") return;
      hasLoadedBatches.current = true;

      setLoadingBatches(true);
      try {
        await dispatch(fetchBatches({ location: locId })).unwrap();
      } catch (e) {
        console.error("Batch fetch failed:", e);
      } finally {
        setLoadingBatches(false);
      }
    },
    [dispatch, watchType, showAddEntry]
  );

  useEffect(() => {
    if (showAddEntry && watchType === "STUDENT_PAID" && watchLocation) {
      loadBatches(watchLocation);
    }
  }, [showAddEntry, watchType, watchLocation, loadBatches]);

  /** FETCH STUDENTS */
  const loadStudents = useCallback(
    async (batchId: string, locId: string) => {
      if (!showAddEntry || hasLoadedStudents.current || !batchId || !locId)
        return;
      hasLoadedStudents.current = true;

      setLoadingStudents(true);
      try {
        if (existingData?.student?.currentBatchId !== batchId) {
          await dispatch(
            fetchStudents({
              batch: batchId,
              location: locId,
              page: 1,
              limit: 200,
            })
          );
        }
      } catch (e) {
        console.error("Student fetch failed:", e);
      } finally {
        setLoadingStudents(false);
      }
    },
    [dispatch, showAddEntry]
  );

  /** FILTER STUDENTS ON BATCH CHANGE */
  useEffect(() => {
    if (watchType !== "STUDENT_PAID" || !watchBatch) {
      setFilteredStudents([]);
      return;
    }

    const filtered = students.filter((s) => s.currentBatch?.id === watchBatch);
    setFilteredStudents(filtered || existingData?.student);
    console.log("filtered", filtered);

    if (!isEdit && filtered.length === 1) {
      setValue("studentId", filtered[0].id);
    }
  }, [watchBatch, students, watchStudent, watchType, isEdit, setValue]);

  /** CONDITIONAL STUDENT FETCH */
  useEffect(() => {
    if (
      showAddEntry &&
      watchType === "STUDENT_PAID" &&
      watchBatch &&
      watchLocation
    ) {
      const alreadyLoaded = students.some(
        (s) => s.currentBatch?.id === watchBatch
      );
      if (!alreadyLoaded && !hasLoadedStudents.current) {
        loadStudents(watchBatch, watchLocation);
      }
    }
  }, [
    showAddEntry,
    watchBatch,
    watchLocation,
    watchType,
    loadStudents,
    students,
  ]);

  /** RESET DEPENDENT FIELDS WHEN TYPE CHANGES */
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

  /** SUBMIT FORM */
  const onSubmit = async (data: CashBookFormData) => {
    try {
      const { batchId, ...payload } = {
        ...data,
        transactionDate: data.transactionDate.toISOString(),
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

      // await dispatch(
      //   fetchCashbookEntries({
      //     transactionType: payload.transactionType,
      //     locationId: payload.locationId,
      //     year: new Date(payload.transactionDate).getFullYear().toString(),
      //     month: (new Date(payload.transactionDate).getMonth() + 1).toString(),
      //   })

      // );
      if (payload.transactionType === "STUDENT_PAID") {
        handleTabChange("students");
      } else if (payload.transactionType === "OWNER_TAKEN") {
        handleTabChange("owner");
      } else if (payload.transactionType === "OFFICE_EXPENSE") {
        handleTabChange("expenses");
      }
      await dispatch(
        fetchCashbookEntries({
          transactionType: payload.transactionType,
          locationId: payload.locationId,
          year: new Date(payload.transactionDate).getFullYear().toString(),
          month: (new Date(payload.transactionDate).getMonth() + 1).toString(),
        })
      );

      setShowAddEntry(false);
    } catch (e) {
      console.error("Submit failed:", e);
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

          {/* Location */}
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

          {/* Batch Selection (Students Paid only) */}
          {watchType === "STUDENT_PAID" && (
            <div className="space-y-2">
              <Label className="text-white">Batch</Label>
              <Select
                value={watchBatch}
                onValueChange={(v) => setValue("batchId", v)}
                disabled={loadingBatches}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue
                    placeholder={
                      loadingBatches ? "Loading batches..." : "Select batch"
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

          {/* Student Selection */}
          {watchType === "STUDENT_PAID" && watchBatch && (
            <div className="space-y-2">
              <Label className="text-white">Student</Label>
              <Select
                value={watchStudent}
                onValueChange={(v) => setValue("studentId", v)}
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

          {/* Director Selection (Owner Taken only) */}
          {watchType === "OWNER_TAKEN" && (
            <div className="space-y-2">
              <Label className="text-white">Director</Label>
              <Select
                value={watch("directorId")}
                onValueChange={(v) => setValue("directorId", v)}
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

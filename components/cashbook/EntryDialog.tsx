"use client";
import type React from "react";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { format } from "date-fns";

import { Button } from "../ui/button";
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
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { User } from "@/lib/types";
import {
  addCashbookEntry,
  type CashbookEntry,
  fetchCashbookEntries,
  updateCashbookEntry,
} from "@/redux/features/cashbook/cashbookSlice";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { useCashbookForm } from "@/hooks/useCashbookForm";
import { cashBookFormSchema } from "@/lib/validation/cashBookFormSchema";

interface CashBookFormData {
  transactionDate: Date;
  transactionType:
    | "STUDENT_PAID"
    | "OFFICE_EXPENSE"
    | "OWNER_TAKEN"
    | "OTHER_EXPENSE"
    | "OTHER_INCOME";
  description: string;
  amount: number | string; // keep as string while typing; cast to number on submit
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
  cashInHand: number;
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
  cashInHand,
}: EntryDialogProps) {
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.locations.locations);

  // ------------------ Local Form State (replaces React Hook Form) ------------------
  const [form, setForm] = useState<CashBookFormData>({
    transactionDate: new Date(),
    transactionType: "STUDENT_PAID",
    amount: 0,
    locationId: propLocationId,
    description: "",
    referenceId: "",
    studentId: undefined,
    directorId: undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI date for the calendar button text
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // mirrors previous "watch" behavior
  const watchType = form.transactionType;
  const watchLocation = form.locationId;

  // ------------------ Custom hook logic preserved ------------------
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

  // ------------------ Initialize / Edit Mode Prefill ------------------
  useEffect(() => {
    if (isEdit && existingData) {
      const txDate = existingData.transactionDate
        ? new Date(existingData.transactionDate)
        : new Date();

      const prefilled: CashBookFormData = {
        transactionDate: txDate,
        transactionType: existingData.transactionType,
        description: existingData.description ?? "",
        amount: existingData.amount ?? 0,
        locationId: existingData.locationId,
        referenceId: existingData.referenceId ?? "",
        studentId: existingData.studentId ?? undefined,
        directorId: existingData.directorId ?? undefined,
      };

      setForm(prefilled);
      setSelectedDate(txDate);

      // Pre-populate batch & student in edit mode
      if (existingData.transactionType === "STUDENT_PAID") {
        const batchId = existingData.student?.currentBatchId;
        if (batchId) {
          setSelectedBatchId(batchId);
          setSelectedStudentId(existingData.studentId ?? undefined);
        }
      }

      // ✅ FIX: Ensure directorId/studentId appear on first open (hydrate after initial render)
      setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          directorId: existingData.directorId ?? prev.directorId,
          studentId: existingData.studentId ?? prev.studentId,
        }));
      }, 0);
    } else {
      // Reset to defaults on "add"
      setForm({
        transactionDate: new Date(),
        transactionType: "STUDENT_PAID",
        amount: 0,
        description: "",
        locationId: propLocationId,
        referenceId: "",
        studentId: undefined,
        directorId: undefined,
      });
      setSelectedDate(new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEdit,
    existingData,
    propLocationId,
    setSelectedBatchId,
    setSelectedStudentId,
    !selectedBatchId,
  ]);

  // ------------------ Effects: clear dependent fields on type change ------------------
  useEffect(() => {
    if (watchType !== "STUDENT_PAID") {
      setSelectedBatchId(undefined);
      setSelectedStudentId(undefined);
      setField("studentId", undefined, true);
    }
    if (watchType !== "OWNER_TAKEN") {
      setField("directorId", undefined, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchType]);

  // ------------------ Helpers ------------------
  const clearFieldError = (key: string) => {
    setFormErrors((errs) => {
      if (errs[key]) {
        const { [key]: _, ...rest } = errs;
        return rest;
      }
      return errs;
    });
  };

  const setErrorsFromZod = (
    zodFieldErrors: Record<string, string[] | undefined>
  ) => {
    const mapped: Record<string, string> = {};
    for (const [key, messages] of Object.entries(zodFieldErrors)) {
      if (messages && messages.length > 0) mapped[key] = messages[0];
    }
    setFormErrors(mapped);
  };

  const setField = <K extends keyof CashBookFormData>(
    key: K,
    value: CashBookFormData[K],
    clearError = false
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (clearError) clearFieldError(String(key));
  };

  // ------------------ Handlers ------------------
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedStudentId(undefined);
    setField("studentId", undefined, true);
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setField("studentId", studentId, true);
  };

  const handleDirectorChange = (directorId: string) => {
    setField("directorId", directorId, true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Build a clean object for validation (amount must be number)
      const toValidate: CashBookFormData = {
        ...form,
        amount:
          typeof form.amount === "string" ? Number(form.amount) : form.amount,
      };

      const result = cashBookFormSchema.safeParse(toValidate);

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrorsFromZod(fieldErrors as Record<string, string[] | undefined>);
        setIsSubmitting(false);
        return;
      }

      const validData = result.data;
      if (isEdit && existingData) {
        const oldAmount = existingData.amount;
        const newAmount = Number(validData.amount);

        // Calculate the delta
        const difference = newAmount - oldAmount;

        // If increasing the amount and difference > cashInHand, block it
        if (
          (validData.transactionType === "OFFICE_EXPENSE" ||
            validData.transactionType === "OWNER_TAKEN" ||
            validData.transactionType === "OTHER_EXPENSE") &&
          difference > cashInHand
        ) {
          setFormErrors({
            ...formErrors,
            amount: `You can only increase up to ₹${cashInHand} more (current balance).`,
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (
        !isEdit &&
        (validData.transactionType === "OFFICE_EXPENSE" ||
          validData.transactionType === "OWNER_TAKEN" ||
          validData.transactionType === "OTHER_EXPENSE") &&
        Number(validData.amount) > cashInHand
      ) {
        setFormErrors({
          ...formErrors,
          amount: `Amount exceeds available cash in hand (₹${cashInHand}).`,
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        transactionDate: validData.transactionDate.toISOString(),
        transactionType: validData.transactionType,
        amount: Number(validData.amount),
        description: (validData.description ?? "").toString().trim(),
        locationId: validData.locationId,
        referenceId: validData.referenceId?.toString().trim() || undefined,
        studentId: validData.studentId || undefined,
        directorId: validData.directorId || undefined,
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
      } else if (payload.transactionType === "OTHER_EXPENSE") {
        handleTabChange("other-expense");
      } else if (payload.transactionType === "OTHER_INCOME") {
        handleTabChange("other-income");
      }
      // Reset local states
      resetFormState();
      setForm({
        transactionDate: new Date(),
        transactionType: "STUDENT_PAID",
        amount: 0,
        description: "",
        locationId: propLocationId,
        referenceId: "",
        studentId: undefined,
        directorId: undefined,
      });
      setSelectedDate(new Date());
      setFormErrors({});
      setShowAddEntry(false);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowAddEntry(false);
  };

  const now = new Date();
  const isCurrentMonth = (date: Date) =>
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isTxCurrentMonth = selectedDate ? isCurrentMonth(selectedDate) : false;
  const isMoneyType =
    form.transactionType === "OFFICE_EXPENSE" ||
    form.transactionType === "OWNER_TAKEN" ||
    form.transactionType === "OTHER_EXPENSE";
  const disableDate = isEdit && isMoneyType;

  // ✅ disable amount in edit mode if money-type and old month
  const disableAmount = isEdit && isMoneyType && !isTxCurrentMonth;
  // ------------------ Render ------------------
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

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Date & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Date *</Label>
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
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
                      if (d) setField("transactionDate", d, true);
                    }}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover> */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disableDate}
                    className={`w-full justify-start text-left bg-gray-800 border-gray-600 text-white ${
                      disableDate
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                {/* Only show calendar if date is not disabled (Add mode) */}
                {!disableDate && (
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        if (!d) return;
                        // Only allow current month selection
                        const inCurrentMonth =
                          d.getMonth() === now.getMonth() &&
                          d.getFullYear() === now.getFullYear();
                        if (inCurrentMonth) {
                          setSelectedDate(d);
                          setField("transactionDate", d, true);
                        }
                      }}
                      disabled={(date) =>
                        // restrict to current month when adding
                        !isEdit &&
                        (date.getMonth() !== now.getMonth() ||
                          date.getFullYear() !== now.getFullYear())
                      }
                      initialFocus
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                )}
              </Popover>

              {formErrors.transactionDate && (
                <p className="text-red-400 text-sm">
                  {formErrors.transactionDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Transaction Type *</Label>
              <Select
                value={form.transactionType}
                onValueChange={(v) =>
                  setField(
                    "transactionType",
                    v as CashBookFormData["transactionType"],
                    true
                  )
                }
                disabled={isEdit}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white  w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="STUDENT_PAID">Students Paid</SelectItem>
                  <SelectItem value="OFFICE_EXPENSE">Office Expense</SelectItem>
                  <SelectItem value="OWNER_TAKEN">Owner Taken</SelectItem>
                  <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                  <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.transactionType && (
                <p className="text-red-400 text-sm">
                  {formErrors.transactionType}
                </p>
              )}
            </div>
          </div>

          {/* Location - Only for admin users */}
          {user?.role === 1 && (
            <div className="space-y-2">
              <Label className="text-white">Location *</Label>
              <Select
                value={form.locationId}
                onValueChange={(value) => {
                  // 1. Update location
                  setField("locationId", value, true);

                  // 2. Reset dependent fields
                  setField("studentId", undefined, true);

                  // 3. Clear dependent local data arrays
                  setSelectedBatchId(undefined);
                  setSelectedStudentId(undefined);

                  // 4. Fetch new batches for this location
                  if (value)
                    dispatch(fetchBatches({ location: value, limit: 10000 }));
                }}
                disabled
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
              {formErrors.locationId && (
                <p className="text-red-400 text-sm">{formErrors.locationId}</p>
              )}
            </div>
          )}

          {/* Batch Selection - Only for STUDENT_PAID */}
          {form.transactionType === "STUDENT_PAID" && (
            <div className="space-y-2">
              <Label className="text-white">Batch *</Label>
              <Select
                value={selectedBatchId || ""}
                onValueChange={handleBatchChange}
                disabled={loadingBatches || batches.length === 0}
                required
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
          {form.transactionType === "STUDENT_PAID" && selectedBatchId && (
            <div className="space-y-2">
              <Label className="text-white">Student *</Label>
              <Select
                value={form.studentId ?? ""}
                onValueChange={handleStudentChange}
                disabled={loadingStudents || filteredStudents.length === 0}
                required
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
                      {student.name} -{" "}
                      <span className="text-[10px] py-0.5 bg-blue-800 px-2 rounded-md">
                        (AD.NO:{student?.admissionNo})
                      </span>
                      {loadingStudents && <Loader2 className="animate-spin" />}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {formErrors.studentId && (
            <p className="text-red-400 text-sm">{formErrors.studentId}</p>
          )}

          {/* Director Selection - Only for OWNER_TAKEN */}
          {form.transactionType === "OWNER_TAKEN" && (
            <div className="space-y-2">
              <Label className="text-white">Director *</Label>
              <Select
                value={form.directorId ?? ""}
                onValueChange={handleDirectorChange}
                required
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
          {formErrors.directorId && (
            <p className="text-red-400 text-sm">{formErrors.directorId}</p>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-white">Amount *</Label>
            <Input
              type="number"
              step="0.01"
              disabled={disableAmount}
              className={`bg-gray-800 border-gray-600 text-white ${
                disableAmount ? "opacity-60 cursor-not-allowed" : ""
              }`}
              value={form.amount}
              onChange={(e) => {
                const v = e.target.value;
                setField("amount", v, true);
              }}
            />
            {disableAmount && (
              <p className="text-yellow-400 text-sm">
                ⚠️ Amount cannot be edited for past month transactions.
              </p>
            )}

            {formErrors.amount && (
              <p className="text-red-400 text-sm">{formErrors.amount}</p>
            )}

            {(form.transactionType === "OFFICE_EXPENSE" ||
              form.transactionType === "OWNER_TAKEN") &&
              !isEdit &&
              Number(form.amount) > cashInHand && (
                <p className="text-yellow-400 text-sm">
                  ⚠️ Entered amount exceeds cash in hand (₹{cashInHand})
                </p>
              )}

            {(form.transactionType === "OFFICE_EXPENSE" ||
              form.transactionType === "OWNER_TAKEN") &&
              isEdit &&
              Number(form.amount) - (existingData?.amount ?? 0) >
                cashInHand && (
                <p className="text-yellow-400 text-sm">
                  ⚠️ You can only increase up to ₹{cashInHand} more (current
                  balance)
                </p>
              )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              className="bg-gray-800 border-gray-600 text-white min-h-[80px]"
              placeholder="Enter description..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value, true)}
            />
            {formErrors.description && (
              <p className="text-red-400 text-sm">{formErrors.description}</p>
            )}
          </div>

          {/* Reference ID */}
          <div className="space-y-2">
            <Label className="text-white">Reference ID</Label>
            <Input
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Optional reference number"
              value={form.referenceId ?? ""}
              onChange={(e) => setField("referenceId", e.target.value, true)}
            />
            {formErrors.referenceId && (
              <p className="text-red-400 text-sm">{formErrors.referenceId}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
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

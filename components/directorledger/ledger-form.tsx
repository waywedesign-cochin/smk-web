"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DirectorLedgerEntryFormData,
  directorLedgerEntrySchema,
} from "@/lib/validation/directorLedgerSchema";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { fetchStudents } from "@/redux/features/student/studentSlice";
import {
  addDirectorLedgerEntry,
  DirectorLedgerEntry,
  updateDirectorLedgerEntry,
} from "@/redux/features/directorledger/directorSlice";

type EntryFormData = {
  transactionDate: Date;
  amount: number;
  transactionType:
    | "STUDENT_PAID"
    | "OTHER_EXPENSE"
    | "INSTITUTION_GAVE_BANK"
    | "OWNER_TAKEN";
  description: string;
  id?: string | undefined;
  referenceId?: string | undefined;
  studentId?: string | undefined;
  locationId?: string | undefined;
  student?: {
    name: string;
    id: string;
    currentBatchId: string;
    currentBatch: {
      name: string;
    };
  };
};

interface LedgerFormProps {
  locationId?: string;
  directorId: string;
  entry?: EntryFormData | null;
  onSuccess?: () => void;
  isEdit?: boolean;
}

const TRANSACTION_TYPES = [
  { value: "STUDENT_PAID", label: "Student Paid" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
  { value: "INSTITUTION_GAVE_BANK", label: "Institution to Bank" },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 bg-slate-200 rounded-md animate-pulse"></div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-6 px-4 bg-slate-50 rounded-md border border-dashed border-slate-300">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}

export function LedgerForm({
  directorId,
  entry,
  onSuccess,
  isEdit = false,
}: LedgerFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.directorLedger);
  const { locations, loading: locationsLoading } = useAppSelector(
    (state) => state.locations
  );
  const { batches, loading: batchesLoading } = useAppSelector(
    (state) => state.batches
  );
  const { students, loading: studentsLoading } = useAppSelector(
    (state) => state.students
  );
  const [successMessage, setSuccessMessage] = useState("");

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    amount: "",
    transactionType: "STUDENT_PAID" as
      | "STUDENT_PAID"
      | "OTHER_EXPENSE"
      | "INSTITUTION_GAVE_BANK"
      | "OWNER_TAKEN",
    description: "",
    referenceId: "",
    studentId: "",
    locationId: entry?.locationId || "",
    batchId: entry?.student?.currentBatchId || "",
  });

  // Fetch locations on mount
  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  // Fetch batches when location changes
  useEffect(() => {
    if (formData.locationId) {
      dispatch(fetchBatches({ location: formData.locationId }));
    }
  }, [formData.locationId, dispatch]);

  // Fetch students when batch changes
  useEffect(() => {
    if (formData.batchId) {
      dispatch(
        fetchStudents({
          currentBatchId: formData?.batchId,
        })
      );
    }
  }, [formData.batchId]);

  // Populate form when editing
  // useEffect(() => {
  //   if (entry) {
  //     const dateStr =
  //       entry.transactionDate instanceof Date
  //         ? entry.transactionDate.toISOString().split("T")[0]
  //         : new Date(entry.transactionDate).toISOString().split("T")[0];

  //     setFormData({
  //       transactionDate: dateStr,
  //       amount: String(entry.amount),
  //       transactionType: entry.transactionType,
  //       description: entry.description,
  //       referenceId: entry.referenceId || "",
  //       studentId: entry.studentId || "",
  //       locationId: entry.locationId || "",
  //       batchId: "",
  //     });
  //     console.log(formData);

  //     if (entry.transactionType === "STUDENT_PAID" && entry.studentId) {
  //       const student = students.find((s) => s.id === entry.studentId);
  //       if (student && student.currentBatch) {
  //         const batchId = student.currentBatch.id ?? "";
  //         const locationIdFromStudent =
  //           student.currentBatch.locationId ?? entry.locationId ?? "";
  //         setFormData((prev) => ({
  //           ...prev,
  //           batchId,
  //           locationId: locationIdFromStudent,
  //         }));
  //       }
  //     }
  //   }
  // }, [entry, students]);
  // Populate form when editing
  // Populate form when editing
  useEffect(() => {
    if (entry) {
      const dateStr =
        entry.transactionDate instanceof Date
          ? entry.transactionDate.toISOString().split("T")[0]
          : new Date(entry.transactionDate).toISOString().split("T")[0];

      setFormData({
        transactionDate: dateStr,
        amount: String(entry.amount),
        transactionType: entry.transactionType,
        description: entry.description,
        referenceId: entry.referenceId || "",
        studentId: entry.studentId || "",
        locationId: entry.locationId || "",
        batchId: entry.student?.currentBatchId || "", // Make sure batchId is set from entry
      });

      // If it's a student paid entry and we have student data, ensure location is set
      if (entry.transactionType === "STUDENT_PAID" && entry.student) {
        // We don't need to set formData again here as it's already set above
        // The useEffect for batches will automatically trigger based on locationId
      }
    }
  }, [entry]); // Remove students from dependencies to avoid infinite loops

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // const handleSelectChange = (name: string, value: string) => {
  //   if (name === "transactionType") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value as typeof formData.transactionType,
  //       studentId: "",
  //       locationId: "",
  //       batchId: "",
  //     }));
  //   } else if (name === "locationId") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //       batchId: "",
  //       studentId: "",
  //     }));
  //   } else if (name === "batchId") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //       studentId: "",
  //     }));
  //   } else {
  //     setFormData((prev) => ({ ...prev, [name]: value }));
  //   }
  //   if (validationErrors[name]) {
  //     setValidationErrors((prev) => {
  //       const { [name]: _, ...rest } = prev;
  //       return rest;
  //     });
  //   }
  // };
  const handleSelectChange = (name: string, value: string) => {
    if (name === "transactionType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value as typeof formData.transactionType,
        studentId: "",
        locationId: "",
        batchId: "",
      }));
    } else if (name === "locationId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        batchId: "",
        studentId: "",
      }));
    } else if (name === "batchId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value, // This should update the batchId
        studentId: "", // Clear student when batch changes
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const formDataToValidate = {
      transactionDate: formData.transactionDate,
      amount: formData.amount,
      transactionType: formData.transactionType || entry?.transactionType,
      description: formData.description,
      referenceId: formData.referenceId,
      studentId: formData.studentId,
      // locationId: formData.locationId,
    };
    console.log(formDataToValidate);
    const result = directorLedgerEntrySchema.safeParse(formDataToValidate);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((error) => {
        const path = error.path[0] as string;
        errors[path] = error.message;
      });
      setValidationErrors(errors);
      console.log(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const isFormValid = () => {
    return (
      formData.transactionDate &&
      formData.amount &&
      formData.description &&
      (formData.transactionType !== "STUDENT_PAID" ||
        (formData.locationId && formData.batchId && formData.studentId))
    );
  };
  // console.log("form data ", formData);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("not validated");
      return;
    }

    const payload = {
      transactionDate: new Date(formData.transactionDate),
      amount: Number.parseFloat(formData.amount),
      transactionType: entry
        ? entry?.transactionType
        : formData.transactionType,
      description: formData.description,
      referenceId: formData.referenceId,
      studentId:
        formData.transactionType === "STUDENT_PAID"
          ? formData.studentId
          : undefined,
      directorId,
    };
    console.log("is edit value", isEdit);
    if (isEdit) {
      console.log("update button clicked and payload is", payload);
      await dispatch(
        updateDirectorLedgerEntry({
          id: entry?.id as string,
          entry: payload,
        })
      );
      setSuccessMessage("Entry updated successfully!");
    } else {
      await dispatch(
        addDirectorLedgerEntry(
          payload as Omit<
            DirectorLedgerEntry,
            "id" | "debitCredit" | "createdAt" | "updatedAt"
          >
        )
      );

      setSuccessMessage("Entry added successfully!");
    }

    setFormData({
      transactionDate: new Date().toISOString().split("T")[0],
      amount: "",
      transactionType: "STUDENT_PAID",
      description: "",
      referenceId: "",
      studentId: "",
      locationId: "",
      batchId: "",
    });
    setValidationErrors({});

    setTimeout(() => {
      setSuccessMessage("");
      onSuccess?.();
    }, 2000);
  };

  const isStudentPaid = formData.transactionType === "STUDENT_PAID";

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="px-6 py-6">
        {error && (
          <Alert className="mb-5 bg-red-50 border-l-4 border-red-500">
            <AlertDescription className="text-red-700 font-medium">
              ⚠️ {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-5 bg-green-50 border-l-4 border-green-500">
            <AlertDescription className="text-green-700 font-medium">
              ✓ {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  !entry ? formData.transactionType : entry?.transactionType
                }
                onValueChange={(value) =>
                  handleSelectChange("transactionType", value)
                }
                disabled={entry ? true : false}
              >
                <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                className={`border-slate-200 hover:border-slate-300 transition ${
                  validationErrors.transactionDate
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              {validationErrors.transactionDate && (
                <p className="text-red-500 text-xs font-medium">
                  {validationErrors.transactionDate}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
                className={`border-slate-200 hover:border-slate-300 transition ${
                  validationErrors.amount
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              {validationErrors.amount && (
                <p className="text-red-500 text-xs font-medium">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            {/* Reference ID */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Reference ID (Optional)
              </label>
              <Input
                type="text"
                name="referenceId"
                value={formData.referenceId}
                onChange={handleChange}
                placeholder="e.g., CHQ-12345"
                className="border-slate-200 hover:border-slate-300 transition"
              />
            </div>

            {/* Location Selector - Only for Student Paid */}
            {isStudentPaid && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Location <span className="text-red-500">*</span>
                </label>
                {locationsLoading ? (
                  <LoadingSkeleton />
                ) : locations.length === 0 ? (
                  <EmptyState message="No locations available" />
                ) : (
                  <Select
                    value={formData.locationId}
                    onValueChange={(value) =>
                      handleSelectChange("locationId", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id as string}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {validationErrors.locationId && (
                  <p className="text-red-500 text-xs font-medium">
                    {validationErrors.locationId}
                  </p>
                )}
              </div>
            )}

            {/* Batch Selector - Only for Student Paid */}
            {/* {isStudentPaid && formData.locationId && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Batch <span className="text-red-500">*</span>
                </label>
                {batchesLoading ? (
                  <LoadingSkeleton />
                ) : batches.length === 0 ? (
                  <EmptyState message="No batches available for this location" />
                ) : (
                  <Select
                    value={
                      entry ? entry.student?.currentBatchId : formData.batchId
                    }
                    onValueChange={(value) =>
                      handleSelectChange("batchId", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch?.id as string}>
                          {batch.name || batch.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )} */}

            {/* Student Selector - Only for Student Paid */}
            {/* {isStudentPaid && (formData.batchId || entry?.student) && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Student <span className="text-red-500">*</span>
                </label>
                {studentsLoading ? (
                  <LoadingSkeleton />
                ) : students.length === 0 ? (
                  <EmptyState message="No students available for this batch" />
                ) : (
                  <Select
                    value={entry ? entry.studentId : formData.studentId}
                    onValueChange={(value) =>
                      handleSelectChange("studentId", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem
                          key={student.id}
                          value={student.id as string}
                        >
                          {student.name + " (" + student.admissionNo + ")"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {validationErrors.studentId && (
                  <p className="text-red-500 text-xs font-medium">
                    📌 {validationErrors.studentId}
                  </p>
                )}
              </div>
            )} */}

            {/* Batch Selector - Only for Student Paid */}
            {isStudentPaid && formData.locationId && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Batch <span className="text-red-500">*</span>
                </label>
                {batchesLoading ? (
                  <LoadingSkeleton />
                ) : batches.length === 0 ? (
                  <EmptyState message="No batches available for this location" />
                ) : (
                  <Select
                    value={formData.batchId} // Always use formData.batchId
                    onValueChange={(value) =>
                      handleSelectChange("batchId", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                      <SelectValue placeholder="Select batch">
                        {formData.batchId &&
                          batches.find((b) => b.id === formData.batchId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch?.id as string}>
                          {batch.name || batch.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Student Selector - Only for Student Paid */}
            {isStudentPaid && (formData.batchId || entry?.student) && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Student <span className="text-red-500">*</span>
                </label>
                {studentsLoading ? (
                  <LoadingSkeleton />
                ) : students.length === 0 ? (
                  <EmptyState message="No students available for this batch" />
                ) : (
                  <Select
                    value={formData.studentId} // Always use formData.studentId
                    onValueChange={(value) =>
                      handleSelectChange("studentId", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 transition">
                      <SelectValue placeholder="Select student">
                        {formData.studentId &&
                          students.find((s) => s.id === formData.studentId)
                            ?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem
                          key={student.id}
                          value={student.id as string}
                        >
                          {student.name + " (" + student.admissionNo + ")"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {validationErrors.studentId && (
                  <p className="text-red-500 text-xs font-medium">
                    📌 {validationErrors.studentId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction description (e.g., Fee payment from student Ahmed Ali)..."
              rows={3}
              required
              className={`border-slate-200 hover:border-slate-300 transition resize-none ${
                validationErrors.description
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs font-medium">
                📌 {validationErrors.description}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : entry ? (
              "✓ Update Entry"
            ) : (
              "+ Add Entry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

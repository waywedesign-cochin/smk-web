"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import { Batch, Student } from "@/lib/types";
import { StudentSchema, StudentInput } from "@/lib/validation/studentSchema";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { Loader2 } from "lucide-react";

interface AddStudentFormProps {
  onSubmit: (studentData: StudentInput) => void;
  onCancel: () => void;
  student?: Student;
  loading?: boolean;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({
  onSubmit,
  onCancel,
  student,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const { batches, loading: batchesLoading } = useAppSelector(
    (state) => state.batches
  );
  const { currentUser } = useAppSelector((state) => state.users);

  const [formData, setFormData] = useState<StudentInput>({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    currentBatchId: student?.currentBatchId || "",
    salesperson: student?.salesperson || "",
    isFundedAccount: student?.isFundedAccount || false,
    admissionNo: student?.admissionNo || "",
    referralInfo: student?.referralInfo || "",
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentInput, string>>
  >({});

  // ✅ LIVE VALIDATION (Runs on every change)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (field: keyof StudentInput, value: any) => {
    const clone = { ...formData, [field]: value };
    const result = StudentSchema.safeParse(clone);

    if (result.success) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } else {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      setErrors((prev) => ({
        ...prev,
        [field]: issue?.message,
      }));
    }
  };

  const handleInputChange = <T extends keyof StudentInput>(
    field: T,
    value: StudentInput[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleSubmit = () => {
    const result = StudentSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof StudentInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof StudentInput;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  useEffect(() => {
    dispatch(
      fetchBatches({
        status: "ACTIVE",
        limit: 10,
        search: debouncedSearch ?? undefined,
        location: currentUser?.locationId || undefined,
      })
    );
  }, [dispatch, debouncedSearch]);

  return (
    <div className="w-full mx-auto rounded-xl p-6 bg-[#0E1628] text-gray-200 border border-white/10 shadow-xl">
      {/* FORM */}
      <div className="space-y-6">
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="text-sm mb-1 block">Name *</label>
            <Input
              className="bg-[#1B2437] border border-gray-600 text-white"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm mb-1 block">Email *</label>
            <Input
              className="bg-[#1B2437] border border-gray-600 text-white"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Phone + Admission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">Phone *</label>
            <Input
              className="bg-[#1B2437] border border-gray-600 text-white"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm mb-1 block">Admission No *</label>
            <Input
              className="bg-[#1B2437] border border-gray-600 text-white"
              placeholder="Admission number"
              value={formData.admissionNo}
              onChange={(e) => handleInputChange("admissionNo", e.target.value)}
              disabled={loading}
            />
            {errors.admissionNo && (
              <p className="text-red-400 text-xs mt-1">{errors.admissionNo}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-sm mb-1 block">Address </label>
          <Textarea
            className="bg-[#1B2437] border border-gray-600 text-white h-24"
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            disabled={loading}
          />
          {errors.address && (
            <p className="text-red-400 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        {/* Salesperson + Batch */}
        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="text-sm mb-1 block">Salesperson</label>
            <Input
              className="bg-[#1B2437] border border-gray-600 text-white"
              placeholder="Salesperson"
              value={formData.salesperson}
              onChange={(e) => handleInputChange("salesperson", e.target.value)}
              disabled={loading}
            />
            {errors.salesperson && (
              <p className="text-red-400 text-xs mt-1">{errors.salesperson}</p>
            )}
          </div>

          {/* Batch Hidden in Edit Mode */}
          {!student && (
            <div className="max-w-xl">
              <label className="text-sm mb-1">Batch *</label>

              <Select
                value={formData.currentBatchId}
                onValueChange={(value) =>
                  handleInputChange("currentBatchId", value)
                }
                disabled={loading}
              >
                <SelectTrigger className="bg-[#1B2437] border border-gray-600 text-white w-full ">
                  <SelectValue
                    placeholder="Select batch"
                    className="truncate"
                  />
                </SelectTrigger>

                <SelectContent
                  onPointerDown={(e) => e.preventDefault()}
                  className="bg-[#1B2437] text-white  text-xs max-h-90 overflow-y-auto w-[var(--radix-select-trigger-width)]"
                >
                  {/*  Search Bar (Shadcn Input) */}
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-2 sticky top-0 bg-[#1B2437] z-10 border-b border-gray-700"
                  >
                    <Input
                      placeholder="Search batch..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="bg-[#111827] text-white border border-gray-600 h-8 text-xs"
                    />
                  </div>

                  {/* Filtered Batch List */}
                  {batchesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                  ) : batches.filter((b) => b.currentCount !== b.slotLimit)
                      .length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      No batches found
                    </div>
                  ) : (
                    batches
                      .filter((b) => b.currentCount !== b.slotLimit)
                      .map((batch) => (
                        <SelectItem
                          key={batch.id}
                          value={batch.id as string}
                          className="text-xs w-full truncate"
                        >
                          {batch.name} ({batch.course?.name})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>

              {errors.currentBatchId && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.currentBatchId}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Referral */}
        <div>
          <label className="text-sm mb-1 block">Referral Info</label>
          <Input
            className="bg-[#1B2437] border border-gray-600 text-white"
            placeholder="Optional referral info"
            value={formData.referralInfo}
            onChange={(e) => handleInputChange("referralInfo", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Funded Account */}
        <div className="flex items-center gap-2 bg-[#1B2437] border border-gray-600 p-3 rounded-lg">
          <Checkbox
            id="funded-account"
            checked={formData.isFundedAccount}
            onCheckedChange={(checked) =>
              handleInputChange("isFundedAccount", Boolean(checked))
            }
            disabled={loading}
          />
          <label htmlFor="funded-account" className="text-sm text-gray-300">
            Funded Account
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-gray-100"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue/90 border border-gray-500 text-white hover:bg-white hover:text-black hover:border-black"
          >
            {student
              ? loading
                ? "Updating..."
                : "Update"
              : loading
              ? "Adding..."
              : "Add Student"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;

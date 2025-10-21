"use client";

import React, { useState } from "react";
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
import { Batch, Student } from "@/lib/types";
import {
  StudentSchema,
  StudentInput,
} from "../../lib/validation/studentSchema";
import { Textarea } from "../ui/textarea";

interface AddStudentFormProps {
  onSubmit: (studentData: StudentInput) => void;
  onCancel: () => void;
  batches: Batch[];
  student?: Student;
  loading?: boolean;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({
  onSubmit,
  onCancel,
  batches,
  student,
  loading = false,
}) => {
  console.log(student);

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

  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentInput, string>>
  >({});

  const handleInputChange = <K extends keyof StudentInput>(
    field: K,
    value: StudentInput[K]
  ) => {
    setFormData((prev: StudentInput) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const result = StudentSchema.safeParse(formData);

    if (!result.success) {
      // collect errors
      const newErrors: Partial<Record<keyof StudentInput, string>> = {};
      result.error.issues.forEach(
        (err: {
          path: (string | number | symbol)[];
          message: string | undefined;
        }) => {
          const field = err.path[0] as keyof StudentInput;
          newErrors[field] = err.message;
        }
      );
      setErrors(newErrors);
      return;
    }

    // clear errors and submit
    setErrors({});
    onSubmit(result.data);
  };

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow p-2">
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Admission No"
              value={formData.admissionNo}
              onChange={(e) => handleInputChange("admissionNo", e.target.value)}
              disabled={loading}
            />
            {errors.admissionNo && (
              <p className="text-red-500 text-sm">{errors.admissionNo}</p>
            )}
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            disabled={loading}
            className="h-32"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>
        {/* Admission Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Salesperson"
              value={formData.salesperson}
              onChange={(e) => handleInputChange("salesperson", e.target.value)}
              disabled={loading}
            />
            {errors.salesperson && (
              <p className="text-red-500 text-sm">{errors.salesperson}</p>
            )}
          </div>

          {/* Batch Select */}
          <div>
            <Select
              value={formData.currentBatchId}
              onValueChange={(value) =>
                handleInputChange("currentBatchId", value)
              }
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches
                  .filter(
                    (batch) =>
                      batch.status === "ACTIVE" &&
                      batch.currentCount !== batch.slotLimit
                  )
                  .map((batch) => (
                    <SelectItem
                      key={batch.id}
                      value={batch.id?.toString() || ""}
                    >
                      {batch.name} ({batch.course?.name})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.currentBatchId && (
              <p className="text-red-500 text-sm">{errors.currentBatchId}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Referral Info"
              value={formData.referralInfo}
              onChange={(e) =>
                handleInputChange("referralInfo", e.target.value)
              }
              disabled={loading}
            />
            {errors.referralInfo && (
              <p className="text-red-500 text-sm">{errors.referralInfo}</p>
            )}
          </div>
          {/* Funded Account */}
          <div className="flex items-center gap-2 border px-4 py-2 rounded-lg w-full">
            <Checkbox
              id="funded-account"
              checked={formData.isFundedAccount}
              onCheckedChange={(checked) =>
                handleInputChange("isFundedAccount", Boolean(checked))
              }
              disabled={loading}
            />
            <label
              htmlFor="funded-account"
              className={`text-sm font-medium ${
                loading ? "text-gray-400" : "text-black"
              }`}
            >
              Funded Account
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          {student ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;

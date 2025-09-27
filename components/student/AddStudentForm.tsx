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
import { Batch } from "@/lib/types";
import {
  StudentSchema,
  StudentInput,
} from "../../lib/validation/studentSchema";

interface AddStudentFormProps {
  onSubmit: (studentData: StudentInput) => void;
  onCancel: () => void;
  batches: Batch[];
  loading?: boolean;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({
  onSubmit,
  onCancel,
  batches,
  loading = false,
}) => {
  const [formData, setFormData] = useState<StudentInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    currentBatchId: "",
    salesperson: "",
    isFundedAccount: false,
    admissionNo: "",
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
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Add New Student
      </h2>

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
              placeholder="Address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={loading}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Admission Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id?.toString() || ""}>
                    {batch.name} ({batch.course?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currentBatchId && (
              <p className="text-red-500 text-sm">{errors.currentBatchId}</p>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;

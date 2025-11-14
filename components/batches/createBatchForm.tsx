"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BatchFormValues,
  batchSchema,
  BatchStatus,
} from "@/lib/validation/batchSchema";
import { Batch, Course, Location, User } from "@/lib/types";

interface AddBatchSheetProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingBatch: Batch | null;
  setEditingBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
  courses: Course[];
  locations: Location[];
  onSubmit: (batch: BatchFormValues, isEdit: boolean) => Promise<void>;
  currentUser: User;
}

export default function AddBatchSheet({
  isOpen,
  setIsOpen,
  editingBatch,
  setEditingBatch,
  courses,
  locations,
  onSubmit,
  currentUser,
}: AddBatchSheetProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      startDate: "",
      courseId: "",
      locationId: currentUser.locationId || "",
      tutor: "",
      coordinator: "",
      slotLimit: 30,
      currentCount: 0,
      // description: "",
      status: "PENDING",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isOpen) {
      if (editingBatch) {
        // Fill form with batch data
        reset({
          name: editingBatch.name || "",
          year: editingBatch.year || new Date().getFullYear(),
          startDate: editingBatch.startDate || "",
          courseId: editingBatch.courseId || "",
          locationId: editingBatch.locationId || currentUser.locationId || "",
          tutor: editingBatch.tutor || "",
          coordinator: editingBatch.coordinator || "",
          slotLimit: editingBatch.slotLimit || 30,
          currentCount: editingBatch.currentCount || 0,
          // description: editingBatch.description || "",
          status: editingBatch.status || "PENDING",
        });
      } else {
        // Fresh form when clicking Add Batch
        reset({
          name: "",
          year: new Date().getFullYear(),
          startDate: "",
          courseId: "",
          locationId: currentUser.locationId || "",
          tutor: "",
          coordinator: "",
          slotLimit: 30,
          currentCount: 0,
          description: "",
          status: "PENDING",
        });
      }
    }
  }, [editingBatch, isOpen]);
  useEffect(() => {
    if (!isOpen) {
      reset(); // fully clears form
    }
  }, [isOpen]);
  // Populate when editing
  useEffect(() => {
    if (editingBatch) {
      reset({
        ...editingBatch,
        courseId: editingBatch.course?.id?.toString(),
        locationId: editingBatch.location?.id?.toString(),
        startDate: editingBatch.startDate
          ? new Date(editingBatch.startDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      reset();
    }
  }, [editingBatch, reset]);

  const submitHandler = async (data: BatchFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data, !!editingBatch);
    setIsSubmitting(false);

    setIsOpen(false);
    setEditingBatch(null);
    reset();
  };

  // --------------------------
  // Clean Input Style Classes
  // --------------------------
  const inputClass =
    "bg-[#1B2437] border border-gray-700 text-gray-200 placeholder:text-gray-500 h-11 rounded-md";

  const selectTriggerClass =
    "bg-[#1B2437] border border-gray-700 text-gray-200 h-11 rounded-md";

  const labelClass = "text-sm text-gray-300";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          reset();
          setEditingBatch(null);
          setIsSubmitting(false);
        }
        if (!editingBatch) {
          reset();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            reset();
            setEditingBatch(null);
          }}
          className="bg-blue-600 text-white"
        >
          {editingBatch ? "Edit Batch" : "Add Batch"}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="!max-w-3xl w-full p-0 bg-[#111827] text-white overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader className="px-8 py-6 border-b border-gray-800">
          <SheetTitle className="text-xl font-semibold text-white">
            {editingBatch ? "Edit Batch" : "Create Batch"}
          </SheetTitle>
        </SheetHeader>

        <div className="px-8 py-8 space-y-8">
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Batch Name *
            </Label>
            <Input
              placeholder="Example: Stock Online 2025-B01"
              className={inputClass}
              {...register("name")}
              required
              id="name"
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name.message}</p>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Year & Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <div className="space-y-2">
              <Label className={labelClass}>Academic Year *</Label>
              <Input
                type="number"
                required
                className={inputClass}
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-red-400 text-sm">{errors.year.message}</p>
              )}
            </div> */}
            <div className="space-y-2">
              <Label className={labelClass}>Academic Year *</Label>

              <Select
                onValueChange={(val) => setValue("year", parseInt(val))}
                value={watch("year")?.toString()}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>

                <SelectContent className="bg-[#1B2437] text-gray-200 max-h-64">
                  {years.map((yr) => (
                    <SelectItem key={yr} value={yr.toString()}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.year && (
                <p className="text-red-400 text-sm">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className={labelClass}>
                Start Date *
              </Label>

              <Input
                id="startDate"
                type="date"
                required
                className={inputClass}
                {...register("startDate")}
                aria-invalid={!!errors.startDate}
                aria-describedby="startDate-error"
              />

              {errors.startDate && (
                <p id="startDate-error" className="text-red-400 text-sm">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Course Selection */}
          <div className="space-y-2">
            <Label className={labelClass}>Course *</Label>

            <Select
              required
              onValueChange={(val) => setValue("courseId", val)}
              defaultValue={watch("courseId")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>

              <SelectContent className="max-h-64 overflow-y-auto bg-[#1B2437] text-gray-200">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id!.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.courseId && (
              <p className="text-red-400 text-sm">{errors.courseId.message}</p>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Location */}
          <div className="space-y-2">
            <Label className={labelClass}>Location *</Label>

            <Select
              onValueChange={(val) => setValue("locationId", val)}
              defaultValue={watch("locationId")}
              disabled={currentUser.role === 3}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>

              <SelectContent className="max-h-64 overflow-y-auto bg-[#1B2437] text-gray-200">
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id!.toString()}>
                    {l.name} - {l.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.locationId && (
              <p className="text-red-400 text-sm">
                {errors.locationId.message}
              </p>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Student Capacity *</Label>
              <Input
                type="number"
                placeholder="30"
                className={inputClass}
                {...register("slotLimit", { valueAsNumber: true })}
              />
              {errors.slotLimit && (
                <p className="text-red-400 text-sm">
                  {errors.slotLimit.message}
                </p>
              )}
            </div>

            {editingBatch && (
              <div className="space-y-2">
                <Label className={labelClass}>Current Enrollment</Label>
                <Input
                  type="number"
                  className={inputClass}
                  {...register("currentCount", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Primary Tutor</Label>
              <Input
                placeholder="Tutor name"
                className={inputClass}
                {...register("tutor")}
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Batch Coordinator</Label>
              <Input
                placeholder="Coordinator name"
                className={inputClass}
                {...register("coordinator")}
              />
            </div>
          </div>

          {/* <Separator className="bg-gray-800" /> */}

          {/* Description */}
          {/* <div className="space-y-2">
            <Label className={labelClass}>Description</Label>
            <Textarea
              rows={4}
              placeholder="Enter description..."
              className="bg-[#1B2437] border border-gray-700 text-gray-200 placeholder:text-gray-500 rounded-md resize-none"
              {...register("description")}
            />
          </div> */}

          {/* Status (Edit mode only) */}
          {editingBatch && (
            <>
              <Separator className="bg-gray-800" />
              <div className="space-y-2">
                <Label className={labelClass}>Batch Status *</Label>

                <Select
                  onValueChange={(val) =>
                    setValue("status", val as BatchStatus)
                  }
                  defaultValue={watch("status")}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent className="bg-[#1B2437] text-gray-200">
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {errors.status && (
                  <p className="text-red-400 text-sm">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setEditingBatch(null);
                reset();
              }}
              className="border-gray-700 text-gray-300 bg-[#1B2437]"
            >
              Cancel
            </Button>

            <Button
              disabled={isSubmitting}
              onClick={handleSubmit(submitHandler)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loader border-white"></span>
                  Submitting...
                </>
              ) : editingBatch ? (
                "Update Batch"
              ) : (
                "Create Batch"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

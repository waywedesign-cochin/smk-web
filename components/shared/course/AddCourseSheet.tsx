"use client";
import React, { useEffect } from "react";
import { Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormValues } from "@/lib/validation/courseSchema";
import { Course } from "@/lib/types";
import { BatchMode } from "@/lib/validation/batchSchema";

interface AddCourseSheetProps {
  isAddSheetOpen: boolean;
  setIsAddSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingCourse: Course | null;
  setEditingCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  onSubmit: (course: Course, isEdit: boolean) => void;
}

export default function AddCourseSheet({
  isAddSheetOpen,
  setIsAddSheetOpen,
  editingCourse,
  setEditingCourse,
  onSubmit,
}: AddCourseSheetProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      description: "",
      baseFee: 0,
      duration: 0,
      isActive: true,
      mode: "OFFLINE",
    },
  });

  // Populate the form whenever editingCourse changes
  useEffect(() => {
    if (editingCourse) {
      reset(editingCourse as CourseFormValues);
    } else {
      reset({
        name: "",
        description: "",
        baseFee: 0,
        duration: 0,
        isActive: true,
        mode: "OFFLINE",
      });
    }
  }, [editingCourse, reset]);

  const submitHandler = (data: CourseFormValues) => {
    onSubmit(
      {
        ...data,
        mode: data.mode as BatchMode,
      },
      !!editingCourse
    );
    setIsAddSheetOpen(false);
    setEditingCourse(null);
    reset();
  };

  return (
    <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            // keep this only for "Add New Course" action
            // avoid clearing editingCourse if you intend to open the sheet for editing
            reset();
            setEditingCourse(null);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {editingCourse ? "Edit Course" : "Add New Course"}
        </Button>
      </SheetTrigger>

      <SheetContent className="max-w-xl w-full p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </SheetTitle>
        </SheetHeader>
        <Separator />

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-6 mt-3 p-4 border rounded-lg border-gray-100 shadow"
        >
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter course name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Course description and overview"
              className="min-h-[100px]"
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Base Fee & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFee">Base Fee (₹) *</Label>
              <Input
                id="baseFee"
                type="number"
                placeholder="Enter base fee"
                {...register("baseFee", { valueAsNumber: true })}
              />
              {errors.baseFee && (
                <p className="text-sm text-red-500">{errors.baseFee.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration*</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Total Months"
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <select
              id="mode"
              {...register("mode")}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="COMBINED">Combined</option>
            </select>
          </div>
          {editingCourse && (
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <Label htmlFor="isActive">Active Course</Label>
                </div>
              )}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddSheetOpen(false);
                setEditingCourse(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

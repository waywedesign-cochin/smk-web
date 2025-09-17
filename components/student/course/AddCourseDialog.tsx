"use client";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface Course {
  id?: string;
  name: string;
  description: string;
  baseFee: number;
  duration: string;
  isActive: boolean;
}

interface AddCourseDialogProps {
  formData: Course;
  setFormData: React.Dispatch<React.SetStateAction<Course>>;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingCourse: Course | null;
  setEditingCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  resetForm: () => void;
  onSubmit: (course: Course, isEdit: boolean) => void;
}

export default function AddCourseDialog({
  formData,
  setFormData,
  isAddDialogOpen,
  setIsAddDialogOpen,
  editingCourse,
  setEditingCourse,
  resetForm,
  onSubmit,
}: AddCourseDialogProps) {
  const handleSubmit = () => {
    onSubmit(formData, !!editingCourse);
    setIsAddDialogOpen(false);
    setEditingCourse(null);
    resetForm();
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Plus className="h-4 w-4 mr-2" />
          {editingCourse ? "Edit Course" : "Add New Course"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter course name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Course description and overview"
              className="min-h-[100px]"
            />
          </div>

          {/* Base Fee & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFee">Base Fee (₹) *</Label>
              <Input
                id="baseFee"
                type="number"
                min="0"
                value={formData.baseFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseFee: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Course fee amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g. 6 months / 1 year"
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active Course</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingCourse(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import React, { useEffect, useState } from "react";

import {
  addCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
} from "@/redux/features/course/courseSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CourseList } from "@/components/shared/course/CourseList";
import AddCourseSheet from "@/components/shared/course/AddCourseSheet";
import { Course } from "@/lib/types";
export const dynamic = "force-dynamic";

function CoursesPage() {
  const dispatch = useAppDispatch();
  const courses = useAppSelector((state) => state.courses.courses);
  useEffect(() => {
    dispatch(fetchCourses());
  }, []);
  console.log("courses", courses);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const emptyCourse: Course = {
    name: "",
    description: "",
    baseFee: 0,
    duration: "",
    isActive: true,
  };

  const [formData, setFormData] = useState<Course>(emptyCourse);

  const resetForm = () => setFormData(emptyCourse);

  const handleSubmit = (course: Course, isEdit: boolean) => {
    if (isEdit && editingCourse) {
      dispatch(updateCourse(course));
    } else {
      // add new course
      dispatch(addCourse(course));
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData(course);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteCourse(id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Course Configuration</h2>
          <p className="text-muted-foreground">
            Manage courses, fee structures, and enrollment settings
          </p>
        </div>
        <AddCourseSheet
          editingCourse={editingCourse}
          setEditingCourse={setEditingCourse}
          isAddSheetOpen={isAddDialogOpen}
          setIsAddSheetOpen={setIsAddDialogOpen}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Course List */}

      <CourseList
        courses={courses}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default CoursesPage;

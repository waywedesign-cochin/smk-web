"use client";

import React, { useEffect, useState } from "react";
import AddCourseDialog from "@/components/student/course/AddCourseDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
// Course type (same as in dialog)
interface Course {
  id?: number;
  name: string;
  description: string;
  baseFee: number;
  duration: string;
  isActive: boolean;
}

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    const res = await axios.get(`http://localhost:3001/api/course/get-courses`);

    console.log(res?.data);
    setCourses(res?.data?.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
      // update existing course
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id ? { ...course, id: editingCourse.id } : c
        )
      );
    } else {
      // add new course
      setCourses((prev) => [
        ...prev,
        { ...course, id: Date.now() }, // temporary ID, replace with backend ID
      ]);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData(course);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id?: number) => {
    if (!id) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
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
        <AddCourseDialog
          formData={formData} // pass formData
          setFormData={setFormData} // pass setFormData
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          editingCourse={editingCourse}
          setEditingCourse={setEditingCourse}
          resetForm={resetForm}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Course List */}
      <div className="border rounded-lg p-4 space-y-4">
        {courses.length === 0 ? (
          <p className="text-muted-foreground">No courses added yet.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center border-b pb-2 last:border-0"
            >
              <div>
                <h3 className="text-lg font-medium">{course.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
                <p className="text-sm">
                  Fee: ₹{course.baseFee} • Duration: {course.duration}
                </p>
                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={
                      course.isActive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(course)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CoursesPage;

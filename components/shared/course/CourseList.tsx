import DeleteDialogue from "@/components/shared/DashboardSidebar/DeleteDialogue";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";
import { Pencil } from "lucide-react";

interface CourseListProps {
  courses: Course[];
  handleEdit: (course: Course) => void;
  handleDelete: (id: string) => void;
}

export function CourseList({
  courses,
  handleEdit,
  handleDelete,
}: CourseListProps) {
  return (
    <div className="border border-gray-200  rounded-xl p-6 bg-white  transition-shadow duration-300 space-y-6">
      {courses.length === 0 ? (
        <p className="text-gray-500  text-center text-lg font-medium">
          No courses added yet. Start by adding one!
        </p>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100  transition-colors duration-200 border border-gray-100 "
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 ">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-700 ">
                  <span className="font-medium">Fee: ₹{course.baseFee}</span>
                  <span className="font-medium">•</span>
                  <span>Duration: {course.duration} Months</span>
                </div>
                <p className="text-xs font-medium">
                  Status:{" "}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      course.isActive
                        ? "bg-green-100 text-green-700 "
                        : "bg-red-100 text-red-700 "
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1 ${
                        course.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {course.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300  text-gray-700  hover:bg-blue-100  transition-colors duration-200"
                  onClick={() => handleEdit(course)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {/* <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors duration-200"
                  // onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button> */}
                <DeleteDialogue
                  id={course.id as string}
                  title={course.name}
                  handelDelete={handleDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import DeleteDialogue from "@/components/shared/DashboardSidebar/DeleteDialogue";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { Course } from "@/lib/types";
import { Pencil, Trash, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface CourseListProps {
  courses: Course[];
  handleEdit: (course: Course) => void;
  handleDelete: (id: string) => void;
  loading: boolean;
}

export function CourseList({
  courses,
  handleEdit,
  handleDelete,
  loading,
}: CourseListProps) {
  const { currentUser } = useAppSelector((state) => state.users);
  
  const handleCourseDeleteHaveBatches = () => {
    toast(
      "You cannot delete this course because it has batches, students, or fees associated with it. Please remove the related data before deleting the course.",
      {
        duration: 6500,
      }
    );
  };
  return (
    <div className=" bg-gradient-to-br from-[#122147] via-black to-[#122147]  rounded-xl p-6   transition-shadow duration-300 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      ) : !courses.length ? (
        <div className="text-center">
          <p className="text-gray-400  text-center text-md font-medium">
            No courses added yet. Start by adding one!
          </p>{" "}
        </div>
      ) : (
        <div className="grid gap-4">
          {courses?.map((course) => (
            <div
              key={course.id}
              className="flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4 items-center  backdrop-blur-lg p-4 rounded-lg bg-gray-100/10  transition-colors duration-200 border-[1px] border-gray-100/10 "
            >
              <div className="space-y-2">
                <h3 className="text-xl max-sm:text-lg font-semibold text-white ">
                  {course.name}
                </h3>
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
                <p className="text-sm max-sm:text-xs text-gray-300 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm max-sm:text-xs text-gray-100 ">
                  <span className="font-medium">Fee: ₹{course.baseFee}</span>
                  <span className="font-medium">•</span>
                  <span>Duration: {course.duration} Months</span>
                </div>
                <p className="text-xs font-medium">
                  <span>Mode : {course.mode}</span>
                </p>
              </div>
              {(currentUser?.role === 1 || currentUser?.role === 3) && (
                <div className="flex max-sm:justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300  text-gray-700  hover:bg-blue-100  transition-colors duration-200"
                    onClick={() => handleEdit(course)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {course.batches?.length !== 0 && (
                    <Button
                      variant="destructive"
                      className="bg-red-500 h-8 rounded-md gap-1.5 px-3 cursor-pointer hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors duration-200 "
                      onClick={handleCourseDeleteHaveBatches}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}

                  {course.batches?.length === 0 && (
                    <DeleteDialogue
                      id={course.id as string}
                      title={course.name}
                      handelDelete={handleDelete}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

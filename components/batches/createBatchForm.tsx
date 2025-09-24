"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { BookOpen, MapPin, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCourses } from "@/redux/features/course/courseSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { Separator } from "../ui/separator";
import { generateYearOptions } from "@/lib/utils/helper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Location } from "@/lib/types";

const currentYear = new Date().getFullYear();

const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  year: z
    .number()
    .int()
    .min(currentYear - 2, "Invalid year")
    .max(currentYear + 5, "Invalid year"),
  courseId: z.string().min(1, "Course is required"),
  locationId: z.string().min(1, "Location is required"),
  tutor: z.string().optional(),
  coordinator: z.string().optional(),
  slotLimit: z
    .number()
    .int()
    .min(1, "Capacity must be at least 1")
    .max(100, "Capacity cannot exceed 100"),
  mode: z.enum(["ONLINE", "OFFLINE"], { message: "Delivery mode is required" }),
  description: z.string().optional(),
  status: z.string(),
});

type BatchFormValues = z.infer<typeof batchSchema>;

interface CreateBatchFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (batchData: any) => void;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isEdit?: boolean;
}

export function CreateBatchForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: CreateBatchFormProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const dispatch = useAppDispatch();
  const courses = useAppSelector((state) => state.courses.courses);
  const locations = useAppSelector((state) => state.locations.locations);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      if (initialData.course) {
        setSelectedCourse(initialData.course);
      } else if (courses.length > 0 && initialData.courseId) {
        const course = courses.find(
          (c) => c.id?.toString() === initialData.courseId
        );
        if (course) setSelectedCourse(course);
      }

      if (initialData.location) {
        setSelectedLocation(initialData.location);
      } else if (locations.length > 0 && initialData.locationId) {
        const location = locations.find(
          (l) => l.id?.toString() === initialData.locationId
        );
        if (location) setSelectedLocation(location);
      }
    }
  }, [initialData, courses, locations]);

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      year: initialData?.year || currentYear,
      courseId: initialData?.course?.id || initialData?.courseId || "",
      locationId: initialData?.location?.id || initialData?.locationId || "",
      tutor: initialData?.tutor || "",
      coordinator: initialData?.coordinator || "",
      slotLimit: initialData?.slotLimit || 30,
      mode: initialData?.mode || "",
      description: initialData?.description || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const handleCourseSelection = (courseId: string) => {
    const course = courses.find((c) => c?.id?.toString() === courseId);
    setSelectedCourse(course ?? null);
  };

  const handleLocationSelection = (locationId: string) => {
    const location = locations.find((l) => l?.id?.toString() === locationId);
    setSelectedLocation(location ?? null);
  };

  const generateBatchName = () => {
    const year = watch("year");
    if (selectedCourse && year) {
      const courseCode = selectedCourse.name.split(" ").join("").toUpperCase();
      const yearCode = year.toString().slice(-2);
      const batchNumber = "01"; // In real app, this would be auto-generated based on existing batches
      const generatedName = `${courseCode}-${year}-${batchNumber}`;
      setValue("name", generatedName);
    }
  };

  const yearOptions = generateYearOptions(currentYear - 2, currentYear + 5);

  const onSubmitForm = (data: BatchFormValues) => {
    const batchData = {
      ...data,
      id: initialData?.id || Date.now(), // Mock ID for create
      currentCount: initialData?.currentCount || 0,
      course: selectedCourse,
      location: selectedLocation,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(batchData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 px-4">
      {/* Basic Information */}
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Configure the basic batch details and naming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Batch Year *</Label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.year && (
                <p className="text-destructive text-sm">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="course">Course *</Label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCourseSelection(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.id}
                          value={course.id?.toString() ?? ""}
                        >
                          <div className="flex flex-col">
                            <span>{course.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ₹{course.baseFee.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseId && (
                <p className="text-destructive text-sm">
                  {errors.courseId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Batch Name *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateBatchName}
                disabled={!selectedCourse || !watch("year")}
              >
                Auto Generate
              </Button>
            </div>
            <Input
              id="name"
              placeholder="Enter batch name or use auto-generate"
              {...control.register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          {selectedCourse && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Selected Course</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Course:</span>
                  <p className="font-medium">{selectedCourse.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Base Fee:</span>
                  <p className="font-medium">
                    ₹{selectedCourse.baseFee.toLocaleString()}
                  </p>
                </div>
                {selectedCourse.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="text-sm">{selectedCourse.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location & Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Capacity
          </CardTitle>
          <CardDescription>
            Set the location and student capacity for this batch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 ">
              <Label htmlFor="location">Location *</Label>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleLocationSelection(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location?.id?.toString() ?? ""}
                        >
                          <div className="flex flex-col items-start">
                            <span>{location.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.locationId && (
                <p className="text-destructive text-sm">
                  {errors.locationId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotLimit">Student Capacity *</Label>
              <Input
                id="slotLimit"
                type="number"
                placeholder="Maximum students"
                min="1"
                max="100"
                {...control.register("slotLimit", { valueAsNumber: true })}
              />
              {errors.slotLimit && (
                <p className="text-destructive text-sm">
                  {errors.slotLimit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Delivery Mode *</Label>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Online</Badge>
                        <span className="text-sm">Virtual classes only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OFFLINE">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Offline</Badge>
                        <span className="text-sm">In-person classes only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mode && (
              <p className="text-destructive text-sm">{errors.mode.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Assignment
          </CardTitle>
          <CardDescription>
            Assign instructors and coordinators to this batch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tutor">Primary Tutor</Label>
              <Input
                id="tutor"
                placeholder="Enter tutor name"
                {...control.register("tutor")}
              />
              {errors.tutor && (
                <p className="text-destructive text-sm">
                  {errors.tutor.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinator">Batch Coordinator</Label>
              <Input
                id="coordinator"
                placeholder="Enter coordinator name"
                {...control.register("coordinator")}
              />
              {errors.coordinator && (
                <p className="text-destructive text-sm">
                  {errors.coordinator.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Batch Description</Label>
            <Textarea
              id="description"
              placeholder="Enter any additional details about this batch..."
              rows={3}
              {...control.register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Batch" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}

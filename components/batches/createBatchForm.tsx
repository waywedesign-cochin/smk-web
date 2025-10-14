// "use client";
// import { useEffect, useState } from "react";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";
// import { Badge } from "../ui/badge";
// import { BookOpen, MapPin, Users, Calendar } from "lucide-react";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { fetchCourses } from "@/redux/features/course/courseSlice";
// import { fetchLocations } from "@/redux/features/location/locationSlice";
// import { Separator } from "../ui/separator";
// import { generateYearOptions } from "@/lib/utils/helper";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Batch, Course, Location } from "@/lib/types";
// import { BatchFormValues, batchSchema } from "@/lib/validation/batchSchema";

// const currentYear = new Date().getFullYear();

// interface CreateBatchFormProps {
//   onSubmit: (batchData: BatchFormValues, isEdit: boolean) => void;
//   onCancel: () => void;
//   editingBatch?: Batch | null;
//   setEditingBatch?: (batch: Batch | null) => void;
// }

// export function CreateBatchForm({
//   onSubmit,
//   onCancel,
//   editingBatch,
//   setEditingBatch,
// }: CreateBatchFormProps) {
//   const isEdit = !!editingBatch;
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [selectedLocation, setSelectedLocation] = useState<Location | null>(
//     null
//   );

//   const dispatch = useAppDispatch();
//   const courses = useAppSelector((state) => state.courses.courses);
//   const locations = useAppSelector((state) => state.locations.locations);

//   useEffect(() => {
//     dispatch(fetchCourses());
//     dispatch(fetchLocations());
//   }, [dispatch]);

//   // Initialize form with editing batch data
//   useEffect(() => {
//     if (editingBatch) {
//       if (editingBatch.course) {
//         setSelectedCourse(editingBatch.course);
//       }
//       if (editingBatch.location) {
//         setSelectedLocation(editingBatch.location);
//       }
//     }
//   }, [editingBatch]);

//   const form = useForm<BatchFormValues>({
//     resolver: zodResolver(batchSchema),
//     mode: "onChange",
//     defaultValues: {
//       name: editingBatch?.name || "",
//       year: editingBatch?.year || currentYear,
//       startDate: editingBatch?.startDate
//         ? new Date(editingBatch.startDate).toISOString().split("T")[0]
//         : "",
//       courseId:
//         editingBatch?.course?.id?.toString() ||
//         (typeof editingBatch?.courseId === "number"
//           ? editingBatch.courseId.
//           : editingBatch?.courseId) ||
//         undefined,
//       locationId:
//         editingBatch?.location?.id?.toString() ||
//         (typeof editingBatch?.locationId === "number"
//           ? editingBatch.locationId
//           : editingBatch?.locationId) ||
//         undefined,
//       tutor: editingBatch?.tutor || "",
//       coordinator: editingBatch?.coordinator || "",
//       slotLimit: editingBatch?.slotLimit || 30,
//       currentCount: editingBatch?.currentCount || 0,
//       mode: editingBatch?.mode || "OFFLINE",
//       description: editingBatch?.description || "",
//       status: editingBatch?.status || "PENDING",
//     },
//   });

//   const {
//     handleSubmit,
//     control,
//     formState: { errors, isValid },
//     setValue,
//     watch,
//     reset,
//   } = form;

//   const watchYear = watch("year");
//   const watchCourseId = watch("courseId");

//   // Handle course selection
//   const handleCourseSelection = (courseId: string) => {
//     const course = courses.find((c) => c?.id?.toString() === courseId);
//     setSelectedCourse(course ?? null);
//     setValue("courseId", courseId);
//   };

//   // Handle location selection
//   const handleLocationSelection = (locationId: string) => {
//     const location = locations.find((l) => l?.id?.toString() === locationId);
//     setSelectedLocation(location ?? null);
//     setValue("locationId", locationId);
//   };

//   // Auto-generate batch name
//   const generateBatchName = () => {
//     if (selectedCourse && watchYear) {
//       const courseCode = selectedCourse.name
//         .split(" ")
//         .map((word) => word.charAt(0))
//         .join("")
//         .toUpperCase();

//       const yearCode = watchYear.toString();
//       const existingBatchesCount = 1; // You might want to calculate this from existing batches
//       const batchNumber = existingBatchesCount.toString().padStart(2, "0");

//       const generatedName = `${courseCode}-${yearCode}-B${batchNumber}`;
//       setValue("name", generatedName, { shouldValidate: true });
//     }
//   };

//   // Format date for display
//   const formatDateForInput = (dateString: string) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toISOString().split("T")[0];
//   };

//   const yearOptions = generateYearOptions(currentYear - 2, currentYear + 5);

//   const onSubmitForm = (data: BatchFormValues) => {
//     // Prepare data for API submission
//     const batchData = {
//       ...data,
//       // For edit, use existing ID; for create, let backend generate ID
//       ...(isEdit && editingBatch?.id && { id: editingBatch.id }),
//       // Convert date to proper format for backend
//       startDate: new Date(data.startDate).toISOString(),
//       // Include related objects if needed by your API
//       ...(selectedCourse && { course: selectedCourse }),
//       ...(selectedLocation && { location: selectedLocation }),
//     };

//     onSubmit(batchData, isEdit);

//     // Reset form after successful submission if not in edit mode
//     if (!isEdit) {
//       reset();
//       setSelectedCourse(null);
//       setSelectedLocation(null);
//     }
//   };

//   const handleCancel = () => {
//     if (setEditingBatch) {
//       setEditingBatch(null);
//     }
//     onCancel();
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 px-4">
//       {/* Basic Information */}
//       <Separator />
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <BookOpen className="h-5 w-5" />
//             Basic Information
//           </CardTitle>
//           <CardDescription>
//             Configure the basic batch details and naming
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="year">Batch Year *</Label>
//               <Controller
//                 name="year"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     value={field.value.toString()}
//                     onValueChange={(value) => {
//                       field.onChange(parseInt(value));
//                       generateBatchName();
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {yearOptions.map((year) => (
//                         <SelectItem key={year} value={year.toString()}>
//                           {year}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.year && (
//                 <p className="text-destructive text-sm">
//                   {errors.year.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="startDate">Start Date *</Label>
//               <Controller
//                 name="startDate"
//                 control={control}
//                 render={({ field }) => (
//                   <Input
//                     type="date"
//                     {...field}
//                     value={field.value || ""}
//                     min={new Date().toISOString().split("T")[0]}
//                   />
//                 )}
//               />
//               {errors.startDate && (
//                 <p className="text-destructive text-sm">
//                   {errors.startDate.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="courseId">Course *</Label>
//               <Controller
//                 name="courseId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     value={field.value}
//                     onValueChange={(value) => {
//                       field.onChange(value);
//                       handleCourseSelection(value);
//                       generateBatchName();
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a course" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {courses.map((course) => (
//                         <SelectItem
//                           key={course.id}
//                           value={course.id?.toString() ?? ""}
//                         >
//                           <div className="flex flex-col">
//                             <span>{course.name}</span>
//                             <span className="text-xs text-muted-foreground">
//                               ₹{course.baseFee?.toLocaleString()}
//                             </span>
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.courseId && (
//                 <p className="text-destructive text-sm">
//                   {errors.courseId.message}
//                 </p>
//               )}
//             </div>
//             {isEdit && (
//               <div className="space-y-2">
//                 <Label htmlFor="status">Status *</Label>
//                 <Controller
//                   name="status"
//                   control={control}
//                   render={({ field }) => (
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="ACTIVE">Active</SelectItem>
//                         <SelectItem value="PENDING">Pending</SelectItem>
//                         <SelectItem value="COMPLETED">Completed</SelectItem>
//                         <SelectItem value="CANCELLED">Cancelled</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.status && (
//                   <p className="text-destructive text-sm">
//                     {errors.status.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <Label htmlFor="name">Batch Name *</Label>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={generateBatchName}
//                 disabled={!selectedCourse || !watchYear}
//               >
//                 Auto Generate
//               </Button>
//             </div>
//             <Controller
//               name="name"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   placeholder="Enter batch name or use auto-generate"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.name && (
//               <p className="text-destructive text-sm">{errors.name.message}</p>
//             )}
//           </div>

//           {selectedCourse && (
//             <div className="border rounded-lg p-4 bg-muted/50">
//               <h4 className="font-medium mb-2">Selected Course</h4>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Course:</span>
//                   <p className="font-medium">{selectedCourse.name}</p>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Base Fee:</span>
//                   <p className="font-medium">
//                     ₹{selectedCourse.baseFee?.toLocaleString()}
//                   </p>
//                 </div>
//                 {selectedCourse.description && (
//                   <div className="col-span-2">
//                     <span className="text-muted-foreground">Description:</span>
//                     <p className="text-sm">{selectedCourse.description}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Location & Capacity */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="h-5 w-5" />
//             Location & Capacity
//           </CardTitle>
//           <CardDescription>
//             Set the location and student capacity for this batch
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="locationId">Location *</Label>
//               <Controller
//                 name="locationId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     value={field.value}
//                     onValueChange={(value) => {
//                       field.onChange(value);
//                       handleLocationSelection(value);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select location" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {locations.map((location) => (
//                         <SelectItem
//                           key={location.id}
//                           value={location?.id?.toString() ?? ""}
//                         >
//                           <div className="flex flex-col items-start">
//                             <span>{location.name}</span>
//                             <span className="text-xs text-muted-foreground">
//                               {location.address}
//                             </span>
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.locationId && (
//                 <p className="text-destructive text-sm">
//                   {errors.locationId.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="slotLimit">Student Capacity *</Label>
//               <Controller
//                 name="slotLimit"
//                 control={control}
//                 render={({ field }) => (
//                   <Input
//                     type="number"
//                     placeholder="Maximum students"
//                     min="1"
//                     max="100"
//                     {...field}
//                     onChange={(e) =>
//                       field.onChange(parseInt(e.target.value) || 0)
//                     }
//                   />
//                 )}
//               />
//               {errors.slotLimit && (
//                 <p className="text-destructive text-sm">
//                   {errors.slotLimit.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {isEdit && (
//             <div className="space-y-2">
//               <Label htmlFor="currentCount">Current Enrollment</Label>
//               <Controller
//                 name="currentCount"
//                 control={control}
//                 render={({ field }) => (
//                   <Input
//                     type="number"
//                     placeholder="Current student count"
//                     min="0"
//                     max={watch("slotLimit")}
//                     {...field}
//                     onChange={(e) =>
//                       field.onChange(parseInt(e.target.value) || 0)
//                     }
//                   />
//                 )}
//               />
//               {errors.currentCount && (
//                 <p className="text-destructive text-sm">
//                   {errors.currentCount.message}
//                 </p>
//               )}
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="mode">Delivery Mode *</Label>
//             <Controller
//               name="mode"
//               control={control}
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select delivery mode" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ONLINE">
//                       <div className="flex items-center gap-2">
//                         <Badge variant="secondary">Online</Badge>
//                         <span className="text-sm">Virtual classes only</span>
//                       </div>
//                     </SelectItem>
//                     <SelectItem value="OFFLINE">
//                       <div className="flex items-center gap-2">
//                         <Badge variant="default">Offline</Badge>
//                         <span className="text-sm">In-person classes only</span>
//                       </div>
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             {errors.mode && (
//               <p className="text-destructive text-sm">{errors.mode.message}</p>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Staff Assignment */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Staff Assignment
//           </CardTitle>
//           <CardDescription>
//             Assign instructors and coordinators to this batch
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="tutor">Primary Tutor</Label>
//               <Controller
//                 name="tutor"
//                 control={control}
//                 render={({ field }) => (
//                   <Input placeholder="Enter tutor name" {...field} />
//                 )}
//               />
//               {errors.tutor && (
//                 <p className="text-destructive text-sm">
//                   {errors.tutor.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="coordinator">Batch Coordinator</Label>
//               <Controller
//                 name="coordinator"
//                 control={control}
//                 render={({ field }) => (
//                   <Input placeholder="Enter coordinator name" {...field} />
//                 )}
//               />
//               {errors.coordinator && (
//                 <p className="text-destructive text-sm">
//                   {errors.coordinator.message}
//                 </p>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Additional Details */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Additional Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             <Label htmlFor="description">Batch Description</Label>
//             <Controller
//               name="description"
//               control={control}
//               render={({ field }) => (
//                 <Textarea
//                   placeholder="Enter any additional details about this batch..."
//                   rows={3}
//                   {...field}
//                 />
//               )}
//             />
//             {errors.description && (
//               <p className="text-destructive text-sm">
//                 {errors.description.message}
//               </p>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Form Actions */}
//       <div className="flex gap-4 justify-end pt-4">
//         <Button type="button" variant="outline" onClick={handleCancel}>
//           Cancel
//         </Button>
//         <Button type="submit" disabled={!isValid}>
//           {isEdit ? "Update Batch" : "Create Batch"}
//         </Button>
//       </div>
//     </form>
//   );
// }
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
  BatchMode,
  BatchStatus,
} from "@/lib/validation/batchSchema";
import { Batch, Course, Location } from "@/lib/types";

interface AddBatchSheetProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingBatch: Batch | null;
  setEditingBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
  courses: Course[];
  locations: Location[];
  onSubmit: (batch: BatchFormValues, isEdit: boolean) => void;
}

export default function AddBatchSheet({
  isOpen,
  setIsOpen,
  editingBatch,
  setEditingBatch,
  courses,
  locations,
  onSubmit,
}: AddBatchSheetProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      startDate: "",
      courseId: undefined,
      locationId: undefined,
      tutor: "",
      coordinator: "",
      slotLimit: 30,
      currentCount: 0,

      description: "",
      status: "PENDING",
    },
  });

  // Update selectedCourse when courseId changes
  React.useEffect(() => {
    const courseId = watch("courseId");
    if (courseId) {
      const found = courses.find((c) => c.id?.toString() === courseId);
      setSelectedCourse(found ?? null);
    } else {
      setSelectedCourse(null);
    }
  }, [watch("courseId"), courses]);

  // Populate form when editing
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
      setSelectedCourse(editingBatch.course ?? null);
    } else {
      reset();
      setSelectedCourse(null);
    }
  }, [editingBatch, reset]);

  const submitHandler = (data: BatchFormValues) => {
    onSubmit(data, !!editingBatch);
    setIsOpen(false);
    setEditingBatch(null);
    reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            reset();
            setEditingBatch(null);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {editingBatch ? "Edit Batch" : "Add New Batch"}
        </Button>
      </SheetTrigger>

      <SheetContent className="max-w-2xl w-full p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingBatch ? "Edit Batch" : "Create New Batch"}
          </SheetTitle>
        </SheetHeader>
        <Separator />

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-6 mt-3 p-4 border rounded-lg border-gray-100 shadow"
        >
          {/* Batch Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Batch Name *</Label>
            <Input
              id="name"
              placeholder="Enter batch name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Year & Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="courseId">Course *</Label>
            <Select
              onValueChange={(val) => setValue("courseId", val)}
              defaultValue={watch("courseId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses
                  .filter((c) => c.id !== undefined && c.id !== null)
                  .map((c) => (
                    <SelectItem
                      className="flex flex-col"
                      key={c.id}
                      value={c.id!.toString()}
                    >
                      <span>{c.name}</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.courseId && (
              <p className="text-sm text-red-500">{errors.courseId.message}</p>
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
                    ₹{selectedCourse.baseFee?.toLocaleString()}
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="locationId">Location *</Label>
            <Select
              onValueChange={(val) => setValue("locationId", val)}
              defaultValue={watch("locationId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter((l) => l.id !== undefined && l.id !== null)
                  .map((l) => (
                    <SelectItem key={l.id} value={l.id!.toString()}>
                      {l.name} - {l.address}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.locationId && (
              <p className="text-sm text-red-500">
                {errors.locationId.message}
              </p>
            )}
          </div>

          {/* Tutor & Coordinator */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tutor">Tutor</Label>
              <Input
                id="tutor"
                placeholder="Tutor name"
                {...register("tutor")}
              />
              {errors.tutor && (
                <p className="text-sm text-red-500">{errors.tutor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinator">Coordinator</Label>
              <Input
                id="coordinator"
                placeholder="Coordinator name"
                {...register("coordinator")}
              />
              {errors.coordinator && (
                <p className="text-sm text-red-500">
                  {errors.coordinator.message}
                </p>
              )}
            </div>
          </div>

          {/* Slot Limit & Current Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotLimit">Student Capacity *</Label>
              <Input
                id="slotLimit"
                type="number"
                {...register("slotLimit", { valueAsNumber: true })}
              />
              {errors.slotLimit && (
                <p className="text-sm text-red-500">
                  {errors.slotLimit.message}
                </p>
              )}
            </div>

            {editingBatch && (
              <div className="space-y-2">
                <Label htmlFor="currentCount">Current Enrollment</Label>
                <Input
                  id="currentCount"
                  type="number"
                  {...register("currentCount", { valueAsNumber: true })}
                />
                {errors.currentCount && (
                  <p className="text-sm text-red-500">
                    {errors.currentCount.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter batch description..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status (only in edit mode) */}
          {editingBatch && (
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                onValueChange={(val) => setValue("status", val as BatchStatus)}
                defaultValue={watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setEditingBatch(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBatch ? "Update Batch" : "Create Batch"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

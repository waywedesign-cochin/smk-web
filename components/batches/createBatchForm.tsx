// "use client";
// import React, { useEffect } from "react";
// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   BatchFormValues,
//   batchSchema,
//   BatchMode,
//   BatchStatus,
// } from "@/lib/validation/batchSchema";
// import { Batch, Course, Location } from "@/lib/types";

// interface AddBatchSheetProps {
//   isOpen: boolean;
//   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   editingBatch: Batch | null;
//   setEditingBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
//   courses: Course[];
//   locations: Location[];
//   onSubmit: (batch: BatchFormValues, isEdit: boolean) => void;
// }

// export default function AddBatchSheet({
//   isOpen,
//   setIsOpen,
//   editingBatch,
//   setEditingBatch,
//   courses,
//   locations,
//   onSubmit,
// }: AddBatchSheetProps) {
//   const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
//     null
//   );

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<BatchFormValues>({
//     resolver: zodResolver(batchSchema),
//     defaultValues: {
//       name: "",
//       year: new Date().getFullYear(),
//       startDate: "",
//       courseId: undefined,
//       locationId: undefined,
//       tutor: "",
//       coordinator: "",
//       slotLimit: 30,
//       currentCount: 0,

//       description: "",
//       status: "PENDING",
//     },
//   });

//   // Update selectedCourse when courseId changes
//   React.useEffect(() => {
//     const courseId = watch("courseId");
//     if (courseId) {
//       const found = courses.find((c) => c.id?.toString() === courseId);
//       setSelectedCourse(found ?? null);
//     } else {
//       setSelectedCourse(null);
//     }
//   }, [watch("courseId"), courses]);

//   // Populate form when editing
//   useEffect(() => {
//     if (editingBatch) {
//       reset({
//         ...editingBatch,
//         courseId: editingBatch.course?.id?.toString(),
//         locationId: editingBatch.location?.id?.toString(),
//         startDate: editingBatch.startDate
//           ? new Date(editingBatch.startDate).toISOString().split("T")[0]
//           : "",
//       });
//       setSelectedCourse(editingBatch.course ?? null);
//     } else {
//       reset();
//       setSelectedCourse(null);
//     }
//   }, [editingBatch, reset]);

//   const submitHandler = (data: BatchFormValues) => {
//     onSubmit(data, !!editingBatch);
//     setIsOpen(false);
//     setEditingBatch(null);
//     reset();
//   };

//   return (
//     <Sheet open={isOpen} onOpenChange={setIsOpen}>
//       <SheetTrigger asChild>
//         <Button
//           onClick={() => {
//             reset();
//             setEditingBatch(null);
//           }}
//           className="bg-black border border-white hover:bg-white hover:text-black"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           {editingBatch ? "Edit Batch" : "Add New Batch"}
//         </Button>
//       </SheetTrigger>

//       <SheetContent className="max-w-2xl w-full p-4 overflow-y-auto">
//         <SheetHeader>
//           <SheetTitle>
//             {editingBatch ? "Edit Batch" : "Create New Batch"}
//           </SheetTitle>
//         </SheetHeader>
//         <Separator />

//         <form
//           onSubmit={handleSubmit(submitHandler)}
//           className="space-y-6 mt-3 p-4 border rounded-lg border-gray-100 shadow"
//         >
//           {/* Batch Name */}
//           <div className="space-y-2">
//             <Label htmlFor="name">Batch Name *</Label>
//             <Input
//               id="name"
//               placeholder="Enter batch name"
//               {...register("name")}
//             />
//             {errors.name && (
//               <p className="text-sm text-red-500">{errors.name.message}</p>
//             )}
//           </div>

//           {/* Year & Start Date */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="year">Year *</Label>
//               <Input
//                 id="year"
//                 type="number"
//                 {...register("year", { valueAsNumber: true })}
//               />
//               {errors.year && (
//                 <p className="text-sm text-red-500">{errors.year.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="startDate">Start Date *</Label>
//               <Input id="startDate" type="date" {...register("startDate")} />
//               {errors.startDate && (
//                 <p className="text-sm text-red-500">
//                   {errors.startDate.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Course */}
//           <div className="space-y-2">
//             <Label htmlFor="courseId">Course *</Label>
//             <Select
//               onValueChange={(val) => setValue("courseId", val)}
//               defaultValue={watch("courseId")}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a course" />
//               </SelectTrigger>
//               <SelectContent>
//                 {courses
//                   .filter((c) => c.id !== undefined && c.id !== null)
//                   .map((c) => (
//                     <SelectItem
//                       className="flex flex-col"
//                       key={c.id}
//                       value={c.id!.toString()}
//                     >
//                       <span>{c.name}</span>
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//             {errors.courseId && (
//               <p className="text-sm text-red-500">{errors.courseId.message}</p>
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

//           {/* Location */}
//           <div className="space-y-2">
//             <Label htmlFor="locationId">Location *</Label>
//             <Select
//               onValueChange={(val) => setValue("locationId", val)}
//               defaultValue={watch("locationId")}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select location" />
//               </SelectTrigger>
//               <SelectContent>
//                 {locations
//                   .filter((l) => l.id !== undefined && l.id !== null)
//                   .map((l) => (
//                     <SelectItem key={l.id} value={l.id!.toString()}>
//                       {l.name} - {l.address}
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//             {errors.locationId && (
//               <p className="text-sm text-red-500">
//                 {errors.locationId.message}
//               </p>
//             )}
//           </div>

//           {/* Tutor & Coordinator */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="tutor">Tutor</Label>
//               <Input
//                 id="tutor"
//                 placeholder="Tutor name"
//                 {...register("tutor")}
//               />
//               {errors.tutor && (
//                 <p className="text-sm text-red-500">{errors.tutor.message}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="coordinator">Coordinator</Label>
//               <Input
//                 id="coordinator"
//                 placeholder="Coordinator name"
//                 {...register("coordinator")}
//               />
//               {errors.coordinator && (
//                 <p className="text-sm text-red-500">
//                   {errors.coordinator.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Slot Limit & Current Count */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="slotLimit">Student Capacity *</Label>
//               <Input
//                 id="slotLimit"
//                 type="number"
//                 {...register("slotLimit", { valueAsNumber: true })}
//               />
//               {errors.slotLimit && (
//                 <p className="text-sm text-red-500">
//                   {errors.slotLimit.message}
//                 </p>
//               )}
//             </div>

//             {editingBatch && (
//               <div className="space-y-2">
//                 <Label htmlFor="currentCount">Current Enrollment</Label>
//                 <Input
//                   id="currentCount"
//                   type="number"
//                   {...register("currentCount", { valueAsNumber: true })}
//                 />
//                 {errors.currentCount && (
//                   <p className="text-sm text-red-500">
//                     {errors.currentCount.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Enter batch description..."
//               {...register("description")}
//             />
//             {errors.description && (
//               <p className="text-sm text-red-500">
//                 {errors.description.message}
//               </p>
//             )}
//           </div>

//           {/* Status (only in edit mode) */}
//           {editingBatch && (
//             <div className="space-y-2">
//               <Label htmlFor="status">Status *</Label>
//               <Select
//                 onValueChange={(val) => setValue("status", val as BatchStatus)}
//                 defaultValue={watch("status")}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="ACTIVE">Active</SelectItem>
//                   <SelectItem value="PENDING">Pending</SelectItem>
//                   <SelectItem value="COMPLETED">Completed</SelectItem>
//                   <SelectItem value="CANCELLED">Cancelled</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.status && (
//                 <p className="text-sm text-red-500">{errors.status.message}</p>
//               )}
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex justify-end space-x-2 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setIsOpen(false);
//                 setEditingBatch(null);
//                 reset();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button type="submit">
//               {editingBatch ? "Update Batch" : "Create Batch"}
//             </Button>
//           </div>
//         </form>
//       </SheetContent>
//     </Sheet>
//   );
// }
"use client";
import React, { useEffect } from "react";
import {
  Plus,
  BookOpen,
  MapPin,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          {editingBatch ? "Edit Batch" : "Add New Batch"}
        </Button>
      </SheetTrigger>

      <SheetContent className="max-w-5xl w-full p-0 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SheetHeader className="px-8 pt-8 pb-6 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 ">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {editingBatch ? "Edit Batch" : "Create New Batch"}
          </SheetTitle>
          <p className="text-sm text-slate-400 mt-1">
            {editingBatch
              ? "Update batch information"
              : "Fill in the details to create a new batch"}
          </p>
        </SheetHeader>

        <div className="p-8 space-y-8">
          {/* Batch Name - Full Width */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <BookOpen className="h-4 w-4 text-blue-400" />
              </div>
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-slate-200"
              >
                Batch Name <span className="text-red-400">*</span>
              </Label>
            </div>
            <Input
              id="name"
              placeholder="e.g., CS-2024-B01"
              className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/30 h-12 text-lg backdrop-blur-sm"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Year & Start Date - Side by Side */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                </div>
                <Label
                  htmlFor="year"
                  className="text-sm font-semibold text-slate-200"
                >
                  Academic Year <span className="text-red-400">*</span>
                </Label>
              </div>
              <Input
                id="year"
                type="number"
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/30 h-11 backdrop-blur-sm"
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-sm text-red-400">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                  <Calendar className="h-4 w-4 text-green-400" />
                </div>
                <Label
                  htmlFor="startDate"
                  className="text-sm font-semibold text-slate-200"
                >
                  Start Date <span className="text-red-400">*</span>
                </Label>
              </div>
              <Input
                id="startDate"
                type="date"
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/30 h-11 backdrop-blur-sm"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Course Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <GraduationCap className="h-4 w-4 text-purple-400" />
              </div>
              <Label
                htmlFor="courseId"
                className="text-sm font-semibold text-slate-200"
              >
                Course Selection <span className="text-red-400">*</span>
              </Label>
            </div>
            <Select
              onValueChange={(val) => setValue("courseId", val)}
              defaultValue={watch("courseId")}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200 focus:border-purple-500 focus:ring-purple-500/30 h-11 backdrop-blur-sm">
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
              <p className="text-sm text-red-400">{errors.courseId.message}</p>
            )}

            {selectedCourse && (
              <div className="mt-4 p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-600 text-white">
                    Selected Course
                  </Badge>
                  <h4 className="font-semibold text-slate-200">
                    {selectedCourse.name}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">Base Fee:</span>
                  <span className="font-bold text-green-400 text-lg">
                    ₹{selectedCourse.baseFee?.toLocaleString()}
                  </span>
                </div>
                {selectedCourse.description && (
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed border-t border-slate-700/50 pt-3">
                    {selectedCourse.description}
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <MapPin className="h-4 w-4 text-emerald-400" />
              </div>
              <Label
                htmlFor="locationId"
                className="text-sm font-semibold text-slate-200"
              >
                Location <span className="text-red-400">*</span>
              </Label>
            </div>
            <Select
              onValueChange={(val) => setValue("locationId", val)}
              defaultValue={watch("locationId")}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 h-11 backdrop-blur-sm">
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
              <p className="text-sm text-red-400">
                {errors.locationId.message}
              </p>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Capacity */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
                <Label
                  htmlFor="slotLimit"
                  className="text-sm font-semibold text-slate-200"
                >
                  Student Capacity <span className="text-red-400">*</span>
                </Label>
              </div>
              <Input
                id="slotLimit"
                type="number"
                placeholder="30"
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/30 h-11 backdrop-blur-sm"
                {...register("slotLimit", { valueAsNumber: true })}
              />
              {errors.slotLimit && (
                <p className="text-sm text-red-400">
                  {errors.slotLimit.message}
                </p>
              )}
            </div>

            {editingBatch && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-teal-500/20 rounded-lg border border-teal-500/30">
                    <Users className="h-4 w-4 text-teal-400" />
                  </div>
                  <Label
                    htmlFor="currentCount"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Current Enrollment
                  </Label>
                </div>
                <Input
                  id="currentCount"
                  type="number"
                  placeholder="0"
                  className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/30 h-11 backdrop-blur-sm"
                  {...register("currentCount", { valueAsNumber: true })}
                />
                {errors.currentCount && (
                  <p className="text-sm text-red-400">
                    {errors.currentCount.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Staff Assignment */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <Users className="h-4 w-4 text-orange-400" />
                </div>
                <Label
                  htmlFor="tutor"
                  className="text-sm font-semibold text-slate-200"
                >
                  Primary Tutor
                </Label>
              </div>
              <Input
                id="tutor"
                placeholder="Tutor name"
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/30 h-11 backdrop-blur-sm"
                {...register("tutor")}
              />
              {errors.tutor && (
                <p className="text-sm text-red-400">{errors.tutor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                  <Users className="h-4 w-4 text-amber-400" />
                </div>
                <Label
                  htmlFor="coordinator"
                  className="text-sm font-semibold text-slate-200"
                >
                  Batch Coordinator
                </Label>
              </div>
              <Input
                id="coordinator"
                placeholder="Coordinator name"
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/30 h-11 backdrop-blur-sm"
                {...register("coordinator")}
              />
              {errors.coordinator && (
                <p className="text-sm text-red-400">
                  {errors.coordinator.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-violet-500/20 rounded-lg border border-violet-500/30">
                <BookOpen className="h-4 w-4 text-violet-400" />
              </div>
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-slate-200"
              >
                Batch Description
              </Label>
            </div>
            <Textarea
              id="description"
              placeholder="Enter batch description..."
              rows={4}
              className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/30 resize-none backdrop-blur-sm"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status (only in edit mode) */}
          {editingBatch && (
            <>
              <Separator className="bg-slate-700/50" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-pink-500/20 rounded-lg border border-pink-500/30">
                    <Calendar className="h-4 w-4 text-pink-400" />
                  </div>
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Batch Status <span className="text-red-400">*</span>
                  </Label>
                </div>
                <Select
                  onValueChange={(val) =>
                    setValue("status", val as BatchStatus)
                  }
                  defaultValue={watch("status")}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30 h-11 backdrop-blur-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-400">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 pb-2 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setEditingBatch(null);
                reset();
              }}
              className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-200 px-8 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(submitHandler)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 h-11"
            >
              {editingBatch ? "Update Batch" : "Create Batch"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

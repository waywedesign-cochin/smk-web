"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Search,
  Edit,
  Users,
  MapPin,
  GraduationCap,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Filter,
} from "lucide-react";
import AddBatchSheet from "./createBatchForm";
import { Batch, BatchMode, BatchStatus } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addBatch,
  deleteBatch,
  fetchBatches,
  updateBatch,
} from "@/redux/features/batch/batchSlice";
import { BatchFormValues } from "@/lib/validation/batchSchema";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchCourses } from "@/redux/features/course/courseSlice";
import { fetchCurrentUser } from "@/redux/features/user/userSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DarkVeil from "../DarkVeil";

export function Batches() {
  const dispatch = useAppDispatch();
  const { batches, dashboardStats, pagination, loading } = useAppSelector(
    (state) => state.batches
  );
  console.log(pagination);

  const { currentUser } = useAppSelector((state) => state.users);
  const locations = useAppSelector((state) => state.locations.locations);
  const courses = useAppSelector((state) => state.courses.courses);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    mode: "all",
    location: currentUser?.locationId || "",
    course: "all",
    year: new Date().getFullYear().toString(),
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  //fetch batches
  const getBatches = () => {
    dispatch(
      fetchBatches({
        page: pagination?.currentPage,
        limit: pagination?.limit,
        search: debouncedSearch || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        mode: filters.mode !== "all" ? filters.mode : undefined,
        location: filters.location,
        course: filters.course !== "all" ? filters.course : undefined,
        year: filters.year,
      })
    );
  };

  //fetch locations and courses
  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchCourses());
    if (!currentUser?.location?.name) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  //fetch current user
  useEffect(() => {
    if (currentUser?.locationId && !filters.location) {
      setFilters((prev) => ({
        ...prev,
        location: currentUser.locationId || "",
      }));
    }
  }, [currentUser?.locationId]);

  //debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch((filters.search || "").trim());
    }, 500);

    return () => clearTimeout(handler); // cleanup previous timeout
  }, [filters.search]);

  // Fetch when filters change
  useEffect(() => {
    getBatches();
  }, [
    dispatch,
    filters.status,
    filters.mode,
    filters.location,
    filters.course,
    filters.year,
    debouncedSearch,
  ]);

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchBatches({
        page: newPage,
        limit: pagination?.limit,
        search: debouncedSearch || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        mode: filters.mode !== "all" ? filters.mode : undefined,
        location: filters.location,
        course: filters.course !== "all" ? filters.course : undefined,
        year: filters.year,
      })
    );
  };

  const handleCreateBatch = (batchData: BatchFormValues, isEdit: boolean) => {
    const data = {
      ...batchData,
      currentCount: batchData.currentCount ?? 0,
      status: BatchStatus[batchData.status as keyof typeof BatchStatus],
    };

    if (isEdit) {
      dispatch(updateBatch(data));
    } else {
      dispatch(addBatch(data));
    }
    setIsCreateFormOpen(false);
    setEditingBatch(null);

    getBatches();
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsCreateFormOpen(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteBatch(id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px]">
          <DarkVeil />
        </div>

        {/* Content on top */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          {" "}
          <div>
            <h2 className="text-2xl font-semibold">Batch Management</h2>
            <p className="text-muted-foreground">
              Manage course batches, schedules, and enrollments
            </p>
          </div>
          {(currentUser?.role === 1 || currentUser?.role === 3) && (
            <AddBatchSheet
              setIsOpen={setIsCreateFormOpen}
              isOpen={isCreateFormOpen}
              editingBatch={editingBatch}
              setEditingBatch={setEditingBatch}
              onSubmit={handleCreateBatch}
              courses={courses}
              locations={locations}
            />
          )}
        </div>
      </div>
      {/* Filters */}
      <Card className="bg-blue-100/10 text-white border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Filter className="h-5 w-5 text-blue-300" /> Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 items-center">
            {/*  Search (wider) */}
            <div className="relative md:col-span-2 lg:col-span-3 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
              <Input
                placeholder="Search batches..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
              />
            </div>

            {/*  Status */}
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                <SelectItem value="all">All Status </SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/*  Mode */}
            <Select
              value={filters.mode}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="COMBINED">Combined</SelectItem>
              </SelectContent>
            </Select>

            {/*  Course */}
            <Select
              value={filters.course}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, course: value }))
              }
            >
              <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.name}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/*  Location */}
            <Select
              value={filters.location}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, location: value }))
              }
            >
              <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id as string}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year */}
            <Select
              value={filters.year}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, year: value }))
              }
            >
              <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                {Array.from({ length: 6 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Clear button */}
            <Button
              variant="ghost"
              className="w-[120px] bg-black border border-white"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  mode: "all",
                  location: currentUser?.location?.name ?? "",
                  course: "",
                  year: new Date().getFullYear().toString(),
                })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            color: "green",
            label: "Active Batches",
            value: dashboardStats?.activeBatches,
          },
          {
            icon: GraduationCap,
            color: "blue",
            label: "Total Enrollment",
            value: dashboardStats?.totalEnrollment,
          },
          {
            icon: BookOpen,
            color: "orange",
            label: "Available Slots",
            value: dashboardStats?.availableSlots,
          },
          {
            icon: IndianRupee,
            color: "purple",
            label: "Total Revenue",
            value: dashboardStats?.totalRevenue.toLocaleString("en-IN"),
          },
        ].map(({ icon: Icon, color, label, value }, i) => (
          <Card
            key={i}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`bg-${color}-100 p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Batches Table */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>
            Batches List ({pagination.totalCount})
            {loading && (
              <span className="text-sm text-muted-foreground ml-2">
                Loading...
              </span>
            )}
          </CardTitle>
          <CardDescription>All course batches in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
            <Table className="min-w-full divide-y divide-gray-200/10">
              <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
                <TableRow className="bg-black border-none">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Batch Details
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Course & Location
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Instructors
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Enrollment
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Revenue
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Status
                  </TableHead>
                  {(currentUser?.role === 1 || currentUser?.role === 3) && (
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-gray-500"
                    >
                      <div className="flex items-center justify-center h-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-4 text-muted-foreground">
                            Loading batches...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : batches.length > 0 ? (
                  batches.map((batch, idx) => (
                    <TableRow
                      key={batch.id}
                      className={`${
                        idx % 2 === 0
                          ? "bg-black/10 hover:bg-black/20"
                          : "bg-indigo-50/10 hover:bg-indigo-50/20"
                      } transition-colors rounded-lg border-0`}
                    >
                      {/* Batch Details */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                        <p className="font-medium text-white">{batch.name}</p>
                        <p className="text-sm text-gray-400">
                          Year {batch.year}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500/50 text-blue-300 bg-blue-900/20 mt-1"
                        >
                          {batch.course?.mode}
                        </Badge>
                      </TableCell>

                      {/* Course & Location */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                        <p className="font-medium text-white">
                          {batch.course?.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          ₹{batch.course?.baseFee?.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                          <MapPin className="h-4 w-4 text-gray-300" />
                          {batch.location?.name}
                        </div>
                      </TableCell>

                      {/* Instructors */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-white bg-blue-900 p-1 rounded" />
                            {batch.tutor || "TBD"}
                          </div>
                          <p className="text-xs text-gray-400">
                            Coordinator: {batch.coordinator || "TBD"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Enrollment */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{batch.enrollment}</span>
                            <span>{batch.enrollmentPercent}%</span>
                          </div>
                          <Progress
                            value={Number(batch.enrollmentPercent)}
                            className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600 rounded-full"
                          />
                        </div>
                      </TableCell>

                      {/* Revenue */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                        <p className="font-medium text-green-400">
                          ₹{batch.totalFee?.toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-4 00">
                          ₹{batch.collected?.toLocaleString()} collected
                        </p>
                        <p className="text-xs text-red-500">
                          ₹{batch.pending?.toLocaleString()} pending
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            batch.status === "ACTIVE"
                              ? "text-green-400 border-green-400/40 bg-green-900/10"
                              : batch.status === "COMPLETED"
                              ? "text-blue-400 border-blue-400/40 bg-blue-900/10"
                              : batch.status === "CANCELLED"
                              ? "text-red-400 border-red-400/40 bg-red-900/10"
                              : "text-gray-400 border-gray-400/40 bg-gray-900/10"
                          }`}
                        >
                          {batch.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      {(currentUser?.role === 1 || currentUser?.role === 3) && (
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(batch)}
                              className="bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {batch.currentCount === 0 &&
                              batch.status === "PENDING" && (
                                <DeleteDialogue
                                  id={batch.id as string}
                                  title={batch.name}
                                  handelDelete={handleDelete}
                                />
                              )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-gray-500"
                    >
                      No batches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-end mt-6 px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 1
                  )
                  .map((page, index, array) => {
                    const showEllipsis =
                      index < array.length - 1 && array[index + 1] - page > 1;
                    const isActive = pagination.currentPage === page;
                    return (
                      <div key={page} className="flex items-center">
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`${
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-purple-700 text-white shadow-md"
                              : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {page}
                        </Button>
                        {showEllipsis && (
                          <span className="px-2 text-gray-500 select-none">
                            ...
                          </span>
                        )}
                      </div>
                    );
                  })}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Batch Sheet */}
      {/* <Sheet open={isCreateFormOpen} onOpenChange={handleCreateFormOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </SheetTitle>
            <SheetDescription>
              {editingBatch
                ? "Update the batch details"
                : "Set up a new batch with course, location, and capacity details"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateBatchForm
              editingBatch={editingBatch}
              setEditingBatch={setEditingBatch}
              onSubmit={handleCreateBatch}
              onCancel={() => setIsCreateFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet> */}
    </div>
  );
}

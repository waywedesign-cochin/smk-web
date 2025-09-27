// batches.tsx
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { debounce } from "lodash";
import { BatchFormValues } from "@/lib/validation/batchSchema";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchCourses } from "@/redux/features/course/courseSlice";

export function Batches() {
  const dispatch = useAppDispatch();
  const { batches, pagination, loading } = useAppSelector(
    (state) => state.batches
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const locations = useAppSelector((state) => state.locations.locations);
  const courses = useAppSelector((state) => state.courses.courses);

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchCourses());
  }, [dispatch]);
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchBatches({
          page: 1,
          search: searchValue,
          status: statusFilter !== "all" ? statusFilter : undefined,
          mode: modeFilter !== "all" ? modeFilter : undefined,
          location: locationFilter,
          course: courseFilter,
        })
      );
    }, 500),
    [statusFilter, modeFilter, locationFilter, courseFilter]
  );

  // Initial load and when filters change
  useEffect(() => {
    dispatch(
      fetchBatches({
        page: 1,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        mode: modeFilter !== "all" ? modeFilter : undefined,
        location: locationFilter,
        course: courseFilter,
      })
    );
  }, [dispatch, statusFilter, modeFilter, locationFilter, courseFilter]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      dispatch(
        fetchBatches({
          page: 1,
          status: statusFilter !== "all" ? statusFilter : undefined,
          mode: modeFilter !== "all" ? modeFilter : undefined,
          location: locationFilter,
          course: courseFilter,
        })
      );
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchBatches({
        page: newPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        mode: modeFilter !== "all" ? modeFilter : undefined,
        location: locationFilter,
        course: courseFilter,
      })
    );
  };

  const handleCreateBatch = (batchData: BatchFormValues, isEdit: boolean) => {
    const data = {
      ...batchData,
      currentCount: batchData.currentCount ?? 0, // Ensure currentCount is always a number
      status: BatchStatus[batchData.status as keyof typeof BatchStatus],
      mode: BatchMode[batchData.mode as keyof typeof BatchMode],
    };
    console.log(data);

    if (isEdit) {
      dispatch(updateBatch(data));
    } else {
      dispatch(addBatch(data));
    }
    setIsCreateFormOpen(false);
    setEditingBatch(null);

    // Refresh the list after creating/updating
    dispatch(
      fetchBatches({
        page: pagination.currentPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        mode: modeFilter !== "all" ? modeFilter : undefined,
        location: locationFilter,
        course: courseFilter,
      })
    );
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsCreateFormOpen(true);
  };

  const getStatusColor = (status: BatchStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "PENDING":
        return "secondary"; // Changed from "warning" to "secondary"
      default:
        return "outline";
    }
  };

  const getModeColor = (mode: BatchMode) => {
    switch (mode) {
      case "ONLINE":
        return "secondary";
      case "OFFLINE":
        return "default";
      default:
        return "outline";
    }
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteBatch(id));
  };

  // Calculate statistics from current batch data
  const activeBatchesCount = batches.filter(
    (b) => b.status === "ACTIVE"
  ).length;
  const totalEnrollment = batches.reduce(
    (sum, batch) => sum + batch.currentCount,
    0
  );
  const availableSlots = batches.reduce(
    (sum, batch) => sum + (batch.slotLimit - batch.currentCount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Batch Management</h2>
          <p className="text-muted-foreground">
            Manage course batches, schedules, and enrollments
          </p>
        </div>
        {/* <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button> */}
        <AddBatchSheet
          setIsOpen={setIsCreateFormOpen}
          isOpen={isCreateFormOpen}
          editingBatch={editingBatch}
          setEditingBatch={setEditingBatch}
          onSubmit={handleCreateBatch}
          courses={courses}
          locations={locations}
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Modes</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>

            {/* <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            /> */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setModeFilter("all");
                setLocationFilter("");
                setCourseFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-xl font-bold">{activeBatchesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Enrollment
                </p>
                <p className="text-xl font-bold">{totalEnrollment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
                <p className="text-xl font-bold">{availableSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Details</TableHead>
                <TableHead>Course & Location</TableHead>
                <TableHead>Instructors</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Descriptions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{batch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Year {batch.year}
                        </p>
                        <div className="flex gap-1">
                          <Badge
                            variant={getModeColor(batch.mode)}
                            className="text-xs"
                          >
                            {batch.mode}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{batch.course?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{batch.course?.baseFee?.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {batch.location?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3" />
                          {batch.tutor || "TBD"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Coordinator: {batch.coordinator || "TBD"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {batch.currentCount}/{batch.slotLimit}
                          </span>
                          <span>
                            {Math.round(
                              (batch.currentCount / batch.slotLimit) * 100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={(batch.currentCount / batch.slotLimit) * 100}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {batch.description
                            ? batch.description
                            : "No description"}{" "}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(batch)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <DeleteDialogue
                          id={batch?.id as string}
                          title={batch.name}
                          handelDelete={handleDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {loading ? "Loading batches..." : "No batches found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} batches
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
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
                    return (
                      <div key={page} className="flex items-center">
                        <Button
                          variant={
                            pagination.currentPage === page
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                        {showEllipsis && <span className="px-2">...</span>}
                      </div>
                    );
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
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

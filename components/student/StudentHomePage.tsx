"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  History,
  Loader2,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Batch, Student } from "@/lib/types";
import AddStudentForm from "./AddStudentForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import {
  addStudent,
  deleteStudent,
  fetchStudents,
  updateStudent,
} from "@/redux/features/student/studentSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import StudentDetailsView from "./StudentDetailsView";
import Link from "next/link";
import { fetchLocations } from "@/redux/features/location/locationSlice";
// import { mockStudents, mockPayments } from "../../lib/mock-data";
// import { Student } from "../../types";
// import { AddStudentForm } from "../add-student-form";
// types.ts
export interface StudentInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  currentBatchId: string;
  salesperson: string;
  isFundedAccount: boolean;
  admissionNo: string;
}

export function Students() {
  const dispatch = useAppDispatch();
  const batches = useAppSelector((state) => state.batches.batches);
  const { students, pagination, loading, submitting, error } = useAppSelector(
    (state) => state.students
  );
  const locations = useAppSelector((state) => state.locations.locations);

  // State variables
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [accountTypeFilter, setAccountTypeFilter] = useState<
    "all" | "funded" | "regular"
  >("all");

  // Set first location as default if locations exist, otherwise empty string
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>(
    locations && locations.length > 0 ? locations[0]?.id || "" : ""
  );

  const [batchTypeFilter, setBatchTypeFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Filter batches based on selected location - THIS IS CRITICAL
  const filteredBatches = useMemo(() => {
    console.log("Filtering batches with location:", locationTypeFilter);
    console.log("All batches:", batches);

    if (!batches || batches.length === 0) return [];
    if (!locationTypeFilter || locationTypeFilter === "all") return batches;

    const filtered = batches.filter(
      (batch) => batch.locationId === locationTypeFilter
    );
    console.log("Filtered batches:", filtered);
    return filtered;
  }, [batches, locationTypeFilter]);

  // Set batch filter when filteredBatches changes
  useEffect(() => {
    console.log("filteredBatches changed:", filteredBatches);
    if (filteredBatches && filteredBatches.length > 0) {
      // If current batch filter is not in the filtered batches, reset to "all"
      const isCurrentBatchValid = filteredBatches.some(
        (batch) => batch.id === batchTypeFilter
      );
      if (!isCurrentBatchValid && batchTypeFilter !== "all") {
        setBatchTypeFilter("all");
      }
    } else {
      // If no batches available, set to "all"
      setBatchTypeFilter("all");
    }
  }, [filteredBatches, batchTypeFilter]);

  // Fetch batches when location changes
  useEffect(() => {
    if (locationTypeFilter) {
      console.log("Fetching batches for location:", locationTypeFilter);
      dispatch(fetchBatches({ location: locationTypeFilter, limit: 0 }));
    }
  }, [locationTypeFilter, dispatch]);

  // Set initial location when locations are loaded
  useEffect(() => {
    if (locations && locations.length > 0 && !locationTypeFilter) {
      const firstLocationId = locations[0]?.id;
      if (firstLocationId) {
        console.log("Setting initial location:", firstLocationId);
        setLocationTypeFilter(firstLocationId);
      }
    }
  }, [locations, locationTypeFilter]);

  // Fetch initial locations
  useEffect(() => {
    if (!locations || locations.length === 0) {
      console.log("Fetching locations...");
      dispatch(fetchLocations());
    }
  }, [locations, dispatch]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Main data fetching with all filters
  useEffect(() => {
    if (locationTypeFilter) {
      console.log("Fetching students with filters:", {
        location: locationTypeFilter,
        batch: batchTypeFilter,
        search: debouncedSearch,
      });

      dispatch(
        fetchStudents({
          page: pagination?.currentPage || 1,
          limit: itemsPerPage,
          search: debouncedSearch,
          isFundedAccount:
            accountTypeFilter === "funded"
              ? true
              : accountTypeFilter === "regular"
              ? false
              : undefined,
          location: locationTypeFilter,
          batch: batchTypeFilter === "all" ? undefined : batchTypeFilter,
          mode: modeFilter === "all" ? undefined : modeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
      );
    }
  }, [
    dispatch,
    debouncedSearch,
    accountTypeFilter,
    locationTypeFilter,
    batchTypeFilter,
    modeFilter,
    statusFilter,
    itemsPerPage,
    pagination?.currentPage,
  ]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    if (locationTypeFilter) {
      dispatch(
        fetchStudents({
          page,
          limit: itemsPerPage,
          search: debouncedSearch,
          isFundedAccount:
            accountTypeFilter === "funded"
              ? true
              : accountTypeFilter === "regular"
              ? false
              : undefined,
          location: locationTypeFilter,
          batch: batchTypeFilter === "all" ? undefined : batchTypeFilter,
          mode: modeFilter === "all" ? undefined : modeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
      );
    }
  };

  // handlers for add, update, delete...
  const handleAddStudent = async (studentData: StudentInput) => {
    try {
      await dispatch(addStudent(studentData)).unwrap();
      setIsAddFormOpen(false);
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleUpdateStudent = async (studentData: StudentInput) => {
    try {
      await dispatch(
        updateStudent({ id: selectedStudent?.id, ...studentData })
      ).unwrap();
      setIsAddFormOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await dispatch(deleteStudent(studentId));
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Students Management</h2>
          <p className="text-muted-foreground">
            Manage student records and track their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet
            open={isAddFormOpen}
            onOpenChange={(open) => {
              if (!open) setSelectedStudent(null); // Reset when closing
              setIsAddFormOpen(open);
            }}
          >
            <SheetTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-900 to-[#122147] text-white cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full !max-w-lg p-2 overflow-y-auto">
              {" "}
              <SheetHeader>
                <SheetTitle>
                  {selectedStudent ? "Edit Student" : "Add New Student"}
                </SheetTitle>
                <SheetDescription>
                  {selectedStudent
                    ? `Update information for ${selectedStudent.name}`
                    : "Create a new student record and enroll them in a batch"}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 px-4">
                <AddStudentForm
                  student={selectedStudent || undefined}
                  onSubmit={
                    selectedStudent ? handleUpdateStudent : handleAddStudent
                  }
                  onCancel={() => setIsAddFormOpen(false)}
                  batches={batches}
                  loading={submitting}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Account Type Filter */}
            <Select
              value={accountTypeFilter}
              onValueChange={(value) =>
                setAccountTypeFilter(value as "all" | "funded" | "regular")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter - Always has a selected value */}
            <Select
              value={locationTypeFilter}
              onValueChange={(value) => setLocationTypeFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  ?.filter(({ id }) => Boolean(id))
                  .map(({ id, name }) => (
                    <SelectItem key={id!} value={id!}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Batch Filter - Never disabled, shows batches for selected location */}
            {/* Batch Filter */}
            <Select
              value={batchTypeFilter}
              onValueChange={(value) => setBatchTypeFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {filteredBatches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch?.id as string}>
                    {batch.name}{" "}
                    <span className="capitalize">
                      ({batch?.status.toLowerCase()}){" "}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select
              value={modeFilter}
              onValueChange={(value) => setModeFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardDescription className="text-gray-600">
            All registered students in the system
          </CardDescription>
          <p className="text-sm font-medium text-gray-600">
            Total Students: {pagination?.totalCount || 0}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Batch
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Loading students...
                    </div>
                  </TableCell>
                </TableRow>
              ) : students?.length > 0 ? (
                students.map((student, idx) => (
                  <TableRow
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition-colors rounded-lg`}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.admissionNo}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {student.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {student.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">
                        {student.currentBatch?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.currentBatch?.course?.name}
                      </p>
                      <Badge variant="outline">
                        {student.currentBatch?.course?.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          student.isFundedAccount ? "default" : "secondary"
                        }
                      >
                        {student.isFundedAccount ? "Funded" : "Regular"}
                      </Badge>
                      {student.salesperson && (
                        <p className="text-xs text-gray-400">
                          Sales: {student.salesperson}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Link
                        className="flex items-center justify-center text-indigo-600 hover:text-indigo-900"
                        href={`/students/${student.id}`}
                        style={{ width: "1.5rem", height: "1.5rem" }}
                      >
                        <Eye className="h-full w-full my-auto" />
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsAddFormOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <DeleteDialogue
                        id={student.id ? student.id : ""}
                        title={student.name}
                        handelDelete={handleDeleteStudent}
                        loading={submitting}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              {/* Showing X to Y of Z */}
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} students
              </div>

              {/* Pagination buttons */}
              <div className="flex gap-2">
                {/* Previous */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers with ellipsis */}
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
                          className="cursor-pointer"
                        >
                          {page}
                        </Button>
                        {showEllipsis && <span className="px-2">...</span>}
                      </div>
                    );
                  })}

                {/* Next */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

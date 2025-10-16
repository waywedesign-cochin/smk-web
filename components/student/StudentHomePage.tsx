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
  Repeat,
} from "lucide-react";
import { Batch, Student } from "@/lib/types";
import AddStudentForm from "./AddStudentForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import {
  addStudent,
  deleteStudent,
  fetchStudents,
  SwitchBatchPayload,
  switchStudentBatch,
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
import SwitchBatchDialog from "./SwitchBatchDialog";
import toast from "react-hot-toast";
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
  // Switch batch dialog state
  const [showSwitchBatchDialog, setShowSwitchBatchDialog] = useState(false);
  const [studentForBatchSwitch, setStudentForBatchSwitch] =
    useState<Student | null>(null);

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

  //switch batch
  const handleSwitchBatch = async (data: SwitchBatchPayload) => {
    try {
      // Wait for batch switch API to complete
      await dispatch(switchStudentBatch(data)).unwrap();

      // Refresh students list after successful batch switch
      await dispatch(
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
      ).unwrap();

      // Close dialog only after API success
      setShowSwitchBatchDialog(false);
      setStudentForBatchSwitch(null);
    } catch (error) {
      toast.error((error as string) || "An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div
        className="flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: "url('/cource/course.png')",
          backgroundSize: "cover",

          backgroundPosition: "center",
        }}
      >
        {" "}
        <div>
          <h2 className="text-3xl max-md:text-2xl max-sm:text-xl font-semibold">
            Students Management
          </h2>
          <p className="text-white/80 max-md:text-sm max-sm:text-xs">
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
      <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 xl:min-w-xl">
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
      <div className=" bg-gradient-to-br from-[#122147] via-black to-[#122147]  rounded-xl p-6   transition-shadow duration-300 space-y-6 w-full">
        <Card className="overflow-x-auto shadow-md rounded-lg border border-gray-200/10 bg-blue-100/10 ">
          <CardHeader className="bg-gray-50/10 py-2">
            <CardDescription className="text-white">
              All registered students in the system
            </CardDescription>
            <p className="text-sm font-medium text-white">
              Total Students: {pagination?.totalCount || 0}
            </p>
          </CardHeader>
          <CardContent className="p-0 ">
            <Table className="min-w-full divide-y divide-gray-200 bg-black/10">
              <TableHeader className="bg-gray-50/10">
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
              <TableBody className=" divide-y divide-gray-200 bg-black/10 border-0">
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
                        idx % 2 === 0
                          ? "bg-black/10 hover:bg-black/20"
                          : "bg-indigo-50/10 hover:bg-indigo-50/20"
                      }  transition-colors rounded-lg border-0 `}
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-lg capitalize text-white">
                          {student.name}
                          {student?.fees?.some(
                            (fee) =>
                              (fee?.batchHistoryFrom &&
                                fee?.batchHistoryFrom.length > 0) ||
                              (fee?.batchHistoryTo &&
                                fee.batchHistoryTo.length > 0)
                          ) && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 ml-2 border-amber-300 bg-amber-50"
                            >
                              <Repeat className="h-3 w-3 mr-1" />
                              Switched
                            </Badge>
                          )}
                        </p>

                        <p className="text-sm text-white">
                          {student.admissionNo}
                        </p>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-gray-700 bg-white p-1 rounded" />
                          {student.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-blue-400 bg-white p-1 rounded" />
                          {student.phone}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-white">
                          {student.currentBatch?.name}
                        </p>
                        <p className="text-sm text-white">
                          {student.currentBatch?.course?.name}
                        </p>
                        <Badge variant="secondary">
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
                          href={`/students/${student.id}`}
                          className="bg-gray-700 hover:bg-gray-600 p-2 rounded flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 text-white" />
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsAddFormOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteDialogue
                          id={student.id!}
                          title={student.name}
                          handelDelete={handleDeleteStudent}
                          loading={submitting}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStudentForBatchSwitch(student);
                            setShowSwitchBatchDialog(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Repeat className="h-4 w-4" />
                        </Button>
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

            {/* Switch Batch Dialog */}
            {studentForBatchSwitch && (
              <SwitchBatchDialog
                open={showSwitchBatchDialog}
                onOpenChange={setShowSwitchBatchDialog}
                student={studentForBatchSwitch}
                availableBatches={batches}
                onSubmit={handleSwitchBatch}
              />
            )}
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                {/* Showing X to Y of Z */}
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                  to{" "}
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
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
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
    </div>
  );
}

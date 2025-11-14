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
import { set } from "lodash";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import DarkVeil from "../DarkVeil";

// import { mockStudents, mockPayments } from "../../lib/mock-data";
// import { Student } from "../../types";
// import { AddStudentForm } from "../add-student-form";
// types.ts
export interface StudentInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  currentBatchId: string;
  salesperson?: string;
  isFundedAccount: boolean;
  admissionNo: string;
}
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function Students() {
  const dispatch = useAppDispatch();
  const batches = useAppSelector((state) => state.batches.batches);
  const { students, pagination, loading, submitting, error } = useAppSelector(
    (state) => state.students
  );
  const locations = useAppSelector((state) => state.locations.locations);
  const { currentUser } = useAppSelector((state) => state.users);
  // State variables
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [accountTypeFilter, setAccountTypeFilter] = useState<
    "all" | "funded" | "regular"
  >("all");

  // Set first location as default if locations exist, otherwise empty string
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>(
    currentUser?.locationId || ""
  );

  const [batchTypeFilter, setBatchTypeFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [switchFilter, setSwitchFilter] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("2025");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("all");
  const [dueThisWeekFilter, setDueThisWeekFilter] = useState<boolean>(false);

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
      (batch) => batch.location?.id === locationTypeFilter
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
          switched: switchFilter ? true : undefined,
          month: monthFilter === "all" ? undefined : monthFilter,
          year: yearFilter,
          feeStatus: feeStatusFilter === "all" ? undefined : feeStatusFilter,
          dueThisWeek: dueThisWeekFilter ? true : undefined,
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
    switchFilter,
    monthFilter,
    yearFilter,
    feeStatusFilter,
    dueThisWeekFilter,
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
          switched: switchFilter ? true : undefined,
          month: monthFilter === "all" ? undefined : monthFilter,
          year: yearFilter === "all" ? undefined : yearFilter,
          feeStatus: feeStatusFilter === "all" ? undefined : feeStatusFilter,
          dueThisWeek: dueThisWeekFilter ? true : undefined,
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
          switched: switchFilter ? true : undefined,
          month: monthFilter === "all" ? undefined : monthFilter,
          year: yearFilter,
          feeStatus: feeStatusFilter === "all" ? undefined : feeStatusFilter,
          dueThisWeek: dueThisWeekFilter ? true : undefined,
        })
      ).unwrap();

      // Close dialog only after API success
      setShowSwitchBatchDialog(false);
      setStudentForBatchSwitch(null);
    } catch (error) {
      toast.error((error as string) || "An unexpected error occurred");
    }
  };

  const handleResetFilters = () => {
    setMonthFilter("all");
    setAccountTypeFilter("all");
    setBatchTypeFilter("all");
    setModeFilter("all");
    setStatusFilter("all");
    setSwitchFilter(false);
    setFeeStatusFilter("all");
    setDueThisWeekFilter(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px]">
          <DarkVeil />
        </div>

        {/* Content on top */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h2 className="text-3xl max-md:text-2xl max-sm:text-xl font-semibold">
              Students Management
            </h2>
            <p className="text-white/80 max-md:text-sm max-sm:text-xs">
              Manage student records and track their progress
            </p>
          </div>

          {(currentUser?.role === 1 || currentUser?.role === 3) && (
            <div className="flex gap-2">
              <Sheet
                open={isAddFormOpen}
                onOpenChange={(open) => {
                  if (!open) setSelectedStudent(null);
                  setIsAddFormOpen(open);
                }}
              >
                <SheetTrigger asChild>
                  <Button className="bg-black border border-white text-white hover:bg-white hover:text-black">
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full !max-w-lg bg-[#0E1628] text-gray-200 p-2 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      {selectedStudent ? "Edit Student" : "Add New Student"}
                    </SheetTitle>
                    <SheetDescription>
                      {selectedStudent
                        ? `Update information for ${selectedStudent.name}`
                        : "Create a new student record and enroll them in a batch"}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-2 px-4">
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
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap   gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-none xl:min-w-[500px] mt-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-white/50 w-full"
              />
            </div>

            {/* Year Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Year</span>
              <Select
                value={yearFilter?.toString() || ""}
                onValueChange={(value) => setYearFilter(value)}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Filter (only if year is selected) */}
            {yearFilter !== "all" && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-200 mb-1">Month</span>
                <Select
                  value={monthFilter?.toString() || ""}
                  onValueChange={(value) => setMonthFilter(value)}
                >
                  <SelectTrigger className="w-40 border-white/50">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((monthName, index) => (
                      <SelectItem
                        key={index + 1}
                        value={(index + 1).toString()}
                      >
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Account Type Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Account Type</span>
              <Select
                value={accountTypeFilter}
                onValueChange={(value) =>
                  setAccountTypeFilter(value as "all" | "funded" | "regular")
                }
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Location</span>
              <Select
                value={locationTypeFilter}
                onValueChange={(value) => setLocationTypeFilter(value)}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  {locations
                    ?.filter(({ id }) => Boolean(id))
                    .map(({ id, name }) => (
                      <SelectItem key={id!} value={id!}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Batch</span>
              <Select
                value={batchTypeFilter}
                onValueChange={(value) => setBatchTypeFilter(value)}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Batches</SelectItem>
                  {filteredBatches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id as string}>
                      {batch.name}{" "}
                      <span className="capitalize">
                        ({batch?.status.toLowerCase()})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Mode</span>
              <Select
                value={modeFilter}
                onValueChange={(value) => setModeFilter(value)}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switched Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">
                Switched Students
              </span>
              <Select
                value={switchFilter ? "true" : "false"}
                onValueChange={(value) => setSwitchFilter(value === "true")}
              >
                <SelectTrigger className="w-40 border-white/50">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="false">All Students</SelectItem>
                  <SelectItem value="true">Switched Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fee Status Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Fee Status</span>
              <Select
                value={feeStatusFilter}
                onValueChange={(value) => setFeeStatusFilter(value)}
              >
                <SelectTrigger className="w-36 border-white/50">
                  <SelectValue placeholder="Fee Status" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due This Week Filter */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dueThisWeek"
                  checked={dueThisWeekFilter}
                  onCheckedChange={(checked) =>
                    setDueThisWeekFilter(checked === true)
                  }
                  className="border-gray-400 data-[state=checked]:bg-blue-500 cursor-pointer"
                />
                <Label
                  htmlFor="dueThisWeek"
                  className="text-gray-300 text-sm cursor-pointer"
                >
                  Due This Week
                </Label>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-[100px] bg-black border border-white"
              onClick={handleResetFilters}
              size={"sm"}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <div className=" bg-blue-100/10 rounded-xl p-6   transition-shadow duration-300 space-y-6 w-full">
        <Card className="overflow-x-auto shadow-md rounded-lg border border-gray-200/10 bg-[#141617]">
          <CardHeader className="bg-gray-50/10 hover:bg-gray-50/10 py-2">
            <CardDescription className="text-white">
              All registered students in the system
            </CardDescription>
            <p className="text-sm font-medium text-white">
              Total Students: {students?.length}
            </p>
          </CardHeader>
          <CardContent className="p-0 ">
            <Table className="min-w-full divide-y divide-gray-200/10 bg-black">
              <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
                <TableRow className="bg-black border-none">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Student Details
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Contact Info
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Current Batch
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className=" divide-y divide-gray-200/10 bg-black/10 border-0">
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
                              className="text-amber-600 ml-2 border-amber-300 text-[10px] bg-amber-50/10"
                            >
                              <Repeat className="h-1 w-2 mr-1" />
                              Switched
                            </Badge>
                          )}
                        </p>

                        <p className="text-[10px] text-white bg-gray-400/20 p-0.5 px-1 rounded-sm mt-2 w-fit">
                          {student.admissionNo}
                        </p>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-gray-200">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-white bg-sky-900 p-1 rounded" />
                          {student.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-2  mt-2">
                          <Phone className="h-5 w-5 text-white bg-orange-900 p-1 rounded" />
                          {student.phone}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-white">
                          {student.currentBatch?.name}
                        </p>
                        <p className="text-[10px] mt-2 text-white/50">
                          COURSE : {student.currentBatch?.course?.name}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {student.currentBatch?.course?.mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4  whitespace-nowrap ">
                        <div className="flex flex-col justify-start items-start">
                          <Badge
                            variant={
                              student.isFundedAccount
                                ? "destructive"
                                : "default"
                            }
                          >
                            {student.isFundedAccount ? "Funded" : "Regular"}
                          </Badge>
                          {student.salesperson && (
                            <p className="text-xs text-gray-400 mt-2">
                              Sales: {student.salesperson}
                            </p>
                          )}{" "}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <Link
                          href={`/students/${student.id}`}
                          className="bg-gray-700 hover:bg-gray-600 p-2 rounded flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 text-white" />
                        </Link>
                        {(currentUser?.role === 1 ||
                          currentUser?.role === 3) && (
                          <>
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
                              disabled={student?.fees?.some(
                                (fee) =>
                                  (fee?.batchHistoryFrom &&
                                    fee?.batchHistoryFrom.length > 0) ||
                                  (fee?.batchHistoryTo &&
                                    fee.batchHistoryTo.length > 0)
                              )}
                              className="cursor-pointer"
                            >
                              <Repeat className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
            {pagination && pagination?.totalPages > 1 && (
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
      </div>
    </div>
  );
}

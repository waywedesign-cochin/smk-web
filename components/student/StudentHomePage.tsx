"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  Pencil,
} from "lucide-react";
import { Batch, Student } from "@/lib/types";
import AddStudentForm from "./AddStudentForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import {
  addStudent,
  deleteStudent,
  editBatchSwitch,
  fetchStudents,
  setCurrentPage,
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
import Link from "next/link";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import SwitchBatchDialog from "./BatchSwitch/SwitchBatchDialog";
import toast from "react-hot-toast";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import DarkVeil from "../DarkVeil";
import EditBatchSwitchDialog from "./BatchSwitch/EditSwitchBatchDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { set } from "lodash";

export interface StudentInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  currentBatchId: string;
  salesperson?: string;
  isFundedAccount: boolean;
  admissionNo: string;
  referralInfo?: string;
  status: string;
}
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
  const { batches, loading: batchesLoading } = useAppSelector(
    (state) => state.batches
  );
  const { students, pagination, loading, submitting, error } = useAppSelector(
    (state) => state.students
  );
  const locations = useAppSelector((state) => state.locations.locations);
  const { currentUser } = useAppSelector((state) => state.users);
  // State variables
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [batchSearch, setBatchSearch] = useState("");
  const [batchDebouncedSearch, setBatchDebouncedSearch] = useState(batchSearch);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("");

  // Set first location as default if locations exist, otherwise empty string
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>(
    currentUser?.locationId || ""
  );

  const [batchTypeFilter, setBatchTypeFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("");
  const [switchFilter, setSwitchFilter] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("");
  const [dueThisWeekFilter, setDueThisWeekFilter] = useState<boolean>(false);

  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  // Switch batch dialog state
  const [showSwitchBatchDialog, setShowSwitchBatchDialog] = useState(false);
  const [studentForBatchSwitch, setStudentForBatchSwitch] =
    useState<Student | null>(null);
  const [showEditBatchSwitchDialog, setShowEditBatchSwitchDialog] =
    useState(false);
  const [studentForBatchEdit, setStudentForBatchEdit] =
    useState<Student | null>(null);
  const [latestBatchHistory, setLatestBatchHistory] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Filter batches based on selected location - THIS IS CRITICAL
  const filteredBatches = useMemo(() => {
    if (!batches || batches.length === 0) return [];
    if (!locationTypeFilter || locationTypeFilter === "all") return batches;

    const filtered = batches.filter(
      (batch) => batch.location?.id === locationTypeFilter
    );
    return filtered;
  }, [batches, locationTypeFilter]);

  // Set batch filter when filteredBatches changes
  useEffect(() => {
    if (!filteredBatches.length) return;
    if (!batchTypeFilter || batchTypeFilter === "all") return;

    const isValid = filteredBatches.some(
      (batch) => batch.id === batchTypeFilter
    );

    if (!isValid) {
      setBatchTypeFilter("all");
    }
  }, [filteredBatches, batchTypeFilter]);

  // Set initial location when locations are loaded
  useEffect(() => {
    if (locations && locations.length > 0 && !locationTypeFilter) {
      const firstLocationId = locations[0]?.id;
      if (firstLocationId) {
        setLocationTypeFilter(firstLocationId);
      }
    }
  }, [locations, locationTypeFilter]);

  // Fetch batches when location changes
  useEffect(() => {
    if (!locationTypeFilter) return;

    dispatch(
      fetchBatches({
        location: locationTypeFilter,
        status: "ACTIVE",
        limit: 10,
        search: batchDebouncedSearch || undefined,
      })
    );
  }, [locationTypeFilter, batchDebouncedSearch]);

  // Fetch initial locations
  useEffect(() => {
    if (!locations || locations.length === 0) {
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

  //batch search debounce
  useEffect(() => {
    if (batchSearch === "") return;

    const handler = setTimeout(() => {
      setBatchDebouncedSearch(batchSearch);
    }, 250);

    return () => clearTimeout(handler);
  }, [batchSearch]);

  // Fetch student data whenever filters change
  const fetchStudentsData = useCallback(() => {
    if (!locationTypeFilter) return;

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

  useEffect(() => {
    if (!locationTypeFilter) return;
    fetchStudentsData();
  }, [fetchStudentsData]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
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

  //update student
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

  //delete student
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await dispatch(deleteStudent(studentId));
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  //switch batch handler
  const handleSwitchBatch = async (data: SwitchBatchPayload) => {
    try {
      // Wait for batch switch API to complete
      await dispatch(switchStudentBatch(data)).unwrap();
      // Refresh students list after successful batch switch
      fetchStudentsData();

      // Close dialog only after API success
      setShowSwitchBatchDialog(false);
      setStudentForBatchSwitch(null);
    } catch (error) {
      toast.error((error as string) || "An unexpected error occurred");
    }
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setMonthFilter("all");
      setAccountTypeFilter("all");
      setBatchTypeFilter("all");
      setModeFilter("all");
      setStatusFilter("all");
      setSwitchFilter(false);
      setFeeStatusFilter("all");
      setDueThisWeekFilter(false);
    });
  };
  //reset page
  const resetPage = () => {
    dispatch(setCurrentPage(1));
  };

  const handleEditBatchSwitch = async (data: {
    studentId: string;
    batchHistoryId: string;
    newToBatchId: string;
    changeDate: string;
    reason: string;
    newFeeAction: string;
  }) => {
    try {
      await dispatch(editBatchSwitch(data)).unwrap();
      fetchStudentsData();
      setShowEditBatchSwitchDialog(false);
      setLatestBatchHistory(null);
    } catch (err) {}
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-2 rounded-md">
      <div className="relative rounded-2xl overflow-hidden w-full">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
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
                      loading={submitting}
                      locationId={
                        currentUser?.role === 1
                          ? locationTypeFilter
                          : (currentUser?.locationId as string)
                      }
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
        {/* <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-4">
          {/* <div className="flex max-sm:flex-col w-full flex-wrap   gap-4 items-center"> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}

            {/* Year Filter */}
            <div className="w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Year</span>
              <Select
                value={yearFilter?.toString() || ""}
                onValueChange={(value) => {
                  setYearFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full   border-white/50">
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
              <div className=" w-full flex flex-col">
                <span className="text-xs text-gray-200 mb-1">Month</span>
                <Select
                  value={monthFilter?.toString() || ""}
                  onValueChange={(value) => {
                    setMonthFilter(value);
                    resetPage();
                  }}
                >
                  <SelectTrigger className=" w-full border-white/50">
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
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Account Type</span>
              <Select
                value={accountTypeFilter}
                onValueChange={(value) => {
                  setAccountTypeFilter(value as "all" | "funded" | "regular");
                  resetPage();
                }}
              >
                <SelectTrigger className=" w-full border-white/50">
                  <SelectValue placeholder="Funded / Regular" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Location</span>
              <Select
                value={locationTypeFilter}
                onValueChange={(value) => {
                  setLocationTypeFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className=" w-full border-white/50">
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
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Batch</span>
              <Select
                value={batchTypeFilter}
                onValueChange={(value) => {
                  setBatchTypeFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className=" border border-gray-600 text-white w-full">
                  <SelectValue
                    placeholder="Select Batch"
                    className="truncate"
                  />
                </SelectTrigger>

                <SelectContent
                  onPointerDown={(e) => e.preventDefault()}
                  className="bg-[#1B2437] text-white text-xs max-h-90 overflow-y-auto w-[var(--radix-select-trigger-width)]"
                >
                  {/*  Search Bar (Shadcn Input) */}
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-2 sticky top-0 bg-[#1B2437] z-10 border-b border-gray-700"
                  >
                    <Input
                      placeholder="Search batch..."
                      value={batchSearch}
                      onChange={(e) => setBatchSearch(e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="bg-[#111827] text-white border border-gray-600 h-8 text-xs"
                    />
                  </div>

                  {/*  All Batches Option */}
                  <SelectItem value="all" className="text-xs w-full truncate">
                    All Batches
                  </SelectItem>

                  {/* Filtered Batch List (With Search) */}
                  {batchesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                  ) : batches.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      No batches found
                    </div>
                  ) : (
                    batches.map((batch) => (
                      <SelectItem
                        key={batch.id}
                        value={batch.id as string}
                        className="text-xs w-full truncate"
                      >
                        {batch.name}{" "}
                        <span className="capitalize">
                          ({batch.status.toLowerCase()})
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Filter */}
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Batch Mode</span>
              <Select
                value={modeFilter}
                onValueChange={(value) => {
                  setModeFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className=" w-full border-white/50">
                  <SelectValue placeholder="Online / Offline" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full border-white/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REMOVED">Removed</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switched Filter */}
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">
                Switched Students
              </span>
              <Select
                value={switchFilter ? "true" : "false"}
                onValueChange={(value) => {
                  setSwitchFilter(value === "true");
                  resetPage();
                }}
              >
                <SelectTrigger className=" w-full border-white/50">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="false">All Students</SelectItem>
                  <SelectItem value="true">Switched Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fee Status Filter */}
            <div className=" w-full flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Fee Status</span>
              <Select
                value={feeStatusFilter}
                onValueChange={(value) => {
                  setFeeStatusFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full border-white/50">
                  <SelectValue placeholder="Pending / Paid / Refunded" />
                </SelectTrigger>
                <SelectContent className="border-white/50 bg-accent-foreground text-gray-50">
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due This Week Filter */}
            <div className=" w-full flex flex-col">
              <div className="flex items-center mt-auto justify-start space-x-2">
                <Checkbox
                  id="dueThisWeek"
                  checked={dueThisWeekFilter}
                  onCheckedChange={(checked) => {
                    setDueThisWeekFilter(checked === true);
                    resetPage();
                  }}
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
            <div className="relative flex-none xl:col-span-2 w-full max-sm:mt-2 mt-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search by name, admission no, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetPage();
                }}
                className="pl-9 border-white/50 w-full"
              />
            </div>
            <Button
              variant="ghost"
              className="w-[100px] mt-auto mb-1 bg-black border border-white"
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
        <Card className="overflow-x-auto shadow-md rounded-lg border border-gray-200/10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 ">
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
              <TableHeader className="bg-gray-50/10 hover:bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 ">
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
                    Funded/Regular
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
                          ? " bg-gradient-to-br from-gray-950/10 via-gray-900/10 to-gray-950/10"
                          : " bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
                      }  transition-colors rounded-lg border-0 `}
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-lg capitalize text-white">
                          {student.name}
                        </p>

                        <p className="text-[10px] text-white bg-gray-400/20 p-0.5 px-1 rounded-sm mt-2 w-fit">
                          {student.admissionNo}
                        </p>
                        <p>
                          {student?.fees?.some(
                            (fee) =>
                              (fee?.batchHistoryFrom &&
                                fee?.batchHistoryFrom.length > 0) ||
                              (fee?.batchHistoryTo &&
                                fee.batchHistoryTo.length > 0)
                          ) && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 mt-2 border-amber-300 text-[10px] bg-amber-50/10"
                            >
                              <Repeat className="h-1 w-2 mr-1" />
                              {batchTypeFilter === "all"
                                ? "Switched"
                                : batchTypeFilter !== student.currentBatchId
                                ? `Switched to ${student.currentBatch?.name}`
                                : batchTypeFilter === student.currentBatchId
                                ? `Switched from ${student?.fees?.[0]?.batchHistoryTo?.[0]?.fromBatch?.name}`
                                : ""}
                            </Badge>
                          )}
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
                          {student?.fees?.[0].status === "REFUNDED" ? (
                            <span className="text-gray-400 text-sm">
                              {" "}
                              (Refunded)
                            </span>
                          ) : (
                            ""
                          )}
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
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {student.status === "ACTIVE" ? (
                          <Badge className="text-sm bg-green-600">Active</Badge>
                        ) : student.status === "INACTIVE" ? (
                          <Badge className="text-sm bg-gray-500">
                            Inactive
                          </Badge>
                        ) : student.status === "REMOVED" ? (
                          <Badge className="text-sm bg-red-600">Removed</Badge>
                        ) : student.status === "ALUMNI" ? (
                          <Badge className="text-sm bg-blue-600">Alumni</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-sm">
                            {student.status}
                          </Badge>
                        )}
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>

                                <TooltipContent>
                                  <p>Batch Switch</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const latestHistory =
                                        student.fees?.[0]
                                          ?.batchHistoryTo?.[0] ||
                                        student.fees?.[0]
                                          ?.batchHistoryFrom?.[0] ||
                                        null;

                                      if (!latestHistory) return;

                                      setStudentForBatchEdit(student);
                                      setLatestBatchHistory(
                                        latestHistory as unknown as Record<
                                          string,
                                          unknown
                                        >
                                      );
                                      setShowEditBatchSwitchDialog(true);
                                    }}
                                    disabled={
                                      !(
                                        student.fees?.[0]
                                          ?.batchHistoryTo?.[0] ||
                                        student.fees?.[0]?.batchHistoryFrom?.[0]
                                      )
                                    }
                                  >
                                    <Pencil className="h-4 w-4 text-orange-500" />{" "}
                                  </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <p>Edit Batch Switch</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
                onSubmit={handleSwitchBatch}
              />
            )}
            {/* Edit Batch Switch Dialog */}
            {studentForBatchEdit && latestBatchHistory && (
              <EditBatchSwitchDialog
                open={showEditBatchSwitchDialog}
                onOpenChange={setShowEditBatchSwitchDialog}
                student={studentForBatchEdit}
                batchHistoryId={latestBatchHistory!.id as string}
                toBatchId={latestBatchHistory!.toBatchId as string}
                reason={latestBatchHistory!.reason as string}
                feeAction={latestBatchHistory!.feeManageMode as string}
                onSubmit={handleEditBatchSwitch}
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

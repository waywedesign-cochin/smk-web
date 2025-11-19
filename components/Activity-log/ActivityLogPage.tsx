"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Download,
  Filter,
  Search,
  User,
  MapPin,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { CommunicationLog } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchCommunicationLogs,
  FetchCommunicationLogsParams,
} from "@/redux/features/communication-log/communicationLogSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchUsers } from "@/redux/features/user/userSlice";
import { getLogDisplay } from "@/lib/utils/getLogTypeDisplay";
import { exportToExcel } from "@/lib/utils/exportToExcel";
import { BASE_URL } from "@/redux/baseUrl";
import axios from "axios";
import DarkVeil from "../DarkVeil";

export default function ActivityLogPage() {
  const dispatch = useAppDispatch();
  const { communicationLogs, loading, error, pagination } = useAppSelector(
    (state) => state.communicationLogs
  );
  // console.log("communicationLogs", communicationLogs);

  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null);
  const { locations } = useAppSelector((state) => state.locations);
  const { users, currentUser } = useAppSelector((state) => state.users);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString();

  const [filters, setFilters] = useState<FetchCommunicationLogsParams>({
    year: currentYear.toString(),
    month: currentMonth,
    locationId: currentUser?.locationId || "ALL",
    loggedById: currentUser?.id || "ALL",
    search: "",
  });

  //get logs from redux store
  const getLogs = async () => {
    dispatch(
      fetchCommunicationLogs({
        ...filters,
        page: pagination?.currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        locationId:
          filters.locationId === "ALL" ? undefined : filters.locationId,
        loggedById:
          filters.loggedById === "ALL" ? undefined : filters.loggedById,
      })
    );
  };

  //handle filter change
  const handleFilterChange = (
    field: keyof FetchCommunicationLogsParams,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  //debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch((filters.search || "").trim());
    }, 500);

    return () => clearTimeout(handler); // cleanup previous timeout
  }, [filters.search]);

  // CommunicationLogsPage.tsx (or wherever handleExport lives)
  const handleExport = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/communication/logs`, {
        params: {
          locationId: filters.locationId,
          month: filters.month,
          loggedById: filters.loggedById,
          year: filters.year,
          limit: 10000,
        },
      });

      const raw = res.data?.data?.communicationLogs || res.data?.data || [];

      if (!Array.isArray(raw) || raw.length === 0) {
        toast.error("No logs found for export");
        return;
      }

      // Map to desired Excel fields
      const rows = raw.map((e) => ({
        Id: e.id,
        Date: e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
        "Logged By": e.loggedBy?.name || e.loggedById || "",
        "Logged By Email": e.loggedBy?.email || e.loggedByEmail || "",
        "Logged By Role":
          e.loggedBy?.role === 1
            ? "Admin"
            : e.loggedBy?.role === 2
            ? "Director"
            : "Staff",
        Type: e.type || e.transactionType || "",
        Subject: e.subject || "",
        Message: e.message || "",
        "Student Name": e.student?.name || e.studentName || "",
        "Student Email": e.student?.email || e.studentEmail || "",
        "Student Admission Number": e.student?.admissionNo || "",
        "Batch Name":
          e.student?.currentBatch?.name || e.studentCurrentBatchName || "",
        "Location Name": e.location?.name || e.locationName || "",
      }));

      // Export to Excel
      exportToExcel(rows, {
        fileName: "Communication_Logs.xlsx",
        sheetName: "Logs",
        autoFormatHeaders: false, // Already user-friendly keys
      });

      toast.success("Communication logs exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Error exporting file");
    }
  };

  //handle page change
  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchCommunicationLogs({
        ...filters,
        page: newPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        locationId:
          filters.locationId === "ALL" ? undefined : filters.locationId,
        loggedById:
          filters.loggedById === "ALL" ? undefined : filters.loggedById,
      })
    );
  };

  //fetch locations
  useEffect(() => {
    if (!locations || locations.length === 0) {
      dispatch(fetchLocations());
    }
  }, [locations, dispatch]);

  //fetch users
  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [locations, dispatch]);

  //fetch logs on filter change
  useEffect(() => {
    getLogs();
  }, [
    filters.year,
    filters.month,
    filters.locationId,
    filters.loggedById,
    debouncedSearch,
    pagination?.currentPage,
    dispatch,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0A1533] text-white  space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h1 className="text-3xl font-semibold text-white">Activity Logs</h1>
            <p className="text-sm text-gray-300">
              Track all staff actions and activities
            </p>
          </div>

          <Button
            onClick={handleExport}
            className="bg-black border border-white text-white hover:bg-white hover:text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Filter className="h-5 w-5 text-blue-300" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search Input */}
            <div className="relative flex-none xl:min-w-[425px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
              <Input
                placeholder="Search by description or staff..."
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Year Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Year</span>
              <Select
                value={filters.year}
                onValueChange={(v) => handleFilterChange("year", v)}
              >
                <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Filter */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-200 mb-1">Month</span>
              <Select
                value={filters.month}
                onValueChange={(v) => handleFilterChange("month", v)}
              >
                <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All Months</SelectItem>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            {currentUser?.role === 1 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-200 mb-1">Location</span>
                <Select
                  value={filters.locationId}
                  onValueChange={(v) => handleFilterChange("locationId", v)}
                >
                  <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1533] text-white border-white/20">
                    <SelectItem value="ALL">All</SelectItem>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id || ""}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Staff Filter */}
            {currentUser?.role === 1 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-200 mb-1">User</span>
                <Select
                  value={filters.loggedById}
                  onValueChange={(v) => handleFilterChange("loggedById", v)}
                >
                  <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1533] text-white border-white/20">
                    <SelectItem value="ALL">All</SelectItem>
                    {users?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-blue-300" /> Recent Activities
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
            <Table className="min-w-full divide-y divide-gray-200/10">
              <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
                <TableRow className="bg-black border-none">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Subject
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Logged By
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Location
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Loading logs...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : communicationLogs?.length > 0 ? (
                  communicationLogs.map((log, idx) => {
                    return (
                      <TableRow
                        key={log.id}
                        className={`${
                          idx % 2 === 0
                            ? "bg-black/10 hover:bg-black/20"
                            : "bg-indigo-50/10 hover:bg-indigo-50/20"
                        } transition-colors rounded-lg border-0`}
                      >
                        {/* Date */}
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          {new Date(log.date).toLocaleString()}
                        </TableCell>

                        {/* Type */}
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          {getLogDisplay(log)}
                        </TableCell>

                        {/* Subject (clickable) */}
                        <TableCell
                          onClick={() => setSelectedLog(log)}
                          className="px-6 py-4 whitespace-nowrap text-gray-100 cursor-pointer hover:text-blue-300 flex items-center gap-2 group"
                        >
                          <p className="font-medium text-white">
                            {log.subject || "—"}
                          </p>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Eye
                                  size={16}
                                  className="text-gray-400 group-hover:text-blue-300 transition-colors"
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to view details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        {/* Logged By */}
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-white bg-blue-900 p-1 rounded" />
                            <div>
                              <p className="text-white text-sm">
                                {log.loggedBy.username}
                              </p>
                              <p className="text-xs text-gray-400">
                                {log.loggedBy.role === 1
                                  ? "Admin"
                                  : log.loggedBy.role === 2
                                  ? "Director"
                                  : "Staff"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-white bg-gray-800 p-1 rounded" />
                            {log.location?.name || "—"}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      No logs available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-end mt-6 px-4">
              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                {/* Previous */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
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

                {/* Next */}
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

      {/* View log modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent
          // Instantly open/close, no animation
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
               w-[90%] max-w-lg
               bg-gradient-to-b from-[#0B1A3C] via-[#0A1533] to-[#081026]
               border border-white/10 text-white shadow-2xl rounded-2xl
               p-6
               data-[state=open]:animate-slide-in data-[state=closed]:animate-none"
        >
          {/* Accent glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-2xl opacity-30 rounded-2xl pointer-events-none" />

          <DialogHeader className="relative z-10 border-b border-white/10 pb-3">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              {selectedLog?.subject || "Log Details"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1">
              {new Date(selectedLog?.date || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-4 mt-4">
            <p className="text-gray-200 text-sm leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {selectedLog?.message || "No additional message available."}
            </p>

            <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Action Type:</span>
                <span className="text-white font-medium">
                  {selectedLog && getLogDisplay(selectedLog)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Logged By:</span>
                <span className="text-white font-medium">
                  {selectedLog?.loggedBy.username} (
                  {selectedLog?.loggedBy.role === 1
                    ? "Admin"
                    : selectedLog?.loggedBy.role === 2
                    ? "Director"
                    : "Staff"}
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-white font-medium">
                  {selectedLog?.location?.name || "—"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="relative z-10 mt-6 flex justify-end">
            <Button
              onClick={() => setSelectedLog(null)}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 text-white rounded-lg transition-none"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

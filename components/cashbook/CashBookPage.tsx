"use client";
import { useEffect, useState } from "react";
import EntryDialog from "@/components/cashbook/EntryDialog";
import TransactionTable from "@/components/cashbook/TransactionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  CashbookEntry,
  fetchCashbookEntries,
  deleteCashbookEntry,
} from "@/redux/features/cashbook/cashbookSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchCurrentUser, fetchUsers } from "@/redux/features/user/userSlice";
import { Download, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "@/redux/baseUrl";
import DarkVeil from "../DarkVeil";

export const CashBookPage = () => {
  const dispatch = useAppDispatch();
  const { entries, totals, pagination, loading, submitting, error } =
    useAppSelector((s) => s.cashbook);
  const locations = useAppSelector((s) => s.locations.locations);
  const user = useAppSelector((s) => s.users.currentUser);
  const { users } = useAppSelector((s) => s.users);

  // Local state for filters (EXACTLY like students page)
  const [filters, setFilters] = useState({
    locationId: user?.locationId || "",
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    type: "STUDENT_PAID",
  });

  const [activeTab, setActiveTab] = useState("students");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Dialog states
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<CashbookEntry | null>(null);

  const directors = users.filter((u) => u.role === 2);

  const fetchCashbook = () => {
    dispatch(
      fetchCashbookEntries({
        page: pagination?.page || 1,
        limit: itemsPerPage,
        locationId: filters.locationId,
        month: filters.month === "ALL" ? undefined : filters.month,
        year: filters.year === "ALL" ? undefined : filters.year,
        transactionType: filters.type,
      })
    );
  };

  // Fetch initial locations and users
  useEffect(() => {
    if (!locations || locations.length === 0) {
      dispatch(fetchLocations());
    }
    if (!user || !user.id) {
      dispatch(fetchCurrentUser());
    }

    dispatch(fetchUsers());
  }, [dispatch, locations]);

  // MAIN DATA FETCHING EFFECT (EXACTLY like students page)
  useEffect(() => {
    fetchCashbook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    filters.locationId,
    filters.month,
    filters.year,
    // filters.type,
    pagination?.page,
  ]);

  // Tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const typeMap: { [key: string]: string } = {
      students: "STUDENT_PAID",
      expenses: "OFFICE_EXPENSE",
      owner: "OWNER_TAKEN",
    };
    setFilters((prev) => ({
      ...prev,
      type: typeMap[tab] || "STUDENT_PAID",
    }));
    dispatch(
      fetchCashbookEntries({
        page: 1,
        limit: itemsPerPage,
        locationId: filters.locationId,
        month: filters.month === "ALL" ? undefined : filters.month,
        year: filters.year === "ALL" ? undefined : filters.year,
        transactionType: typeMap[tab] || "STUDENT_PAID",
      })
    );
  };

  // Manual refetch function (like students page)

  // Edit handler
  const handleEdit = (entry: CashbookEntry) => {
    setEntryToEdit(entry);
    setShowEditDialog(true);
  };

  // Delete handler with manual refetch
  const handleDeleteEntry = async (id: string) => {
    await dispatch(deleteCashbookEntry(id));
    fetchCashbook();
  };

  // Filter entries by active tab (client-side filtering when type is "ALL")
  const getFilteredEntries = () => {
    if (filters.type === "ALL") {
      const typeMap: { [key: string]: string } = {
        students: "STUDENT_PAID",
        expenses: "OFFICE_EXPENSE",
        owner: "OWNER_TAKEN",
      };
      return entries.filter(
        (entry) => entry.transactionType === typeMap[activeTab]
      );
    }
    return entries;
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    console.log("Page changed to", page);

    dispatch(
      fetchCashbookEntries({
        page,
        limit: itemsPerPage,
        locationId: filters.locationId,
        month: filters.month === "ALL" ? undefined : filters.month,
        year: filters.year === "ALL" ? undefined : filters.year,
        transactionType: filters.type,
      })
    );
  };

  const handleExportCashbook = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cashbook/entries`, {
        params: {
          locationId: filters.locationId,
          month: filters.month,
          year: filters.year,
          transactionType:
            activeTab === "students"
              ? "STUDENT_PAID"
              : activeTab === "expenses"
              ? "OFFICE_EXPENSE"
              : "OWNER_TAKEN",
          limit: 10000,
        },
      });

      const raw =
        res.data?.data?.entries || res.data?.data?.cashbookEntries || [];

      const totals = res.data?.data?.totals || {};

      if (!Array.isArray(raw) || raw.length === 0) {
        toast.error("No cashbook entries found for export");
        return;
      }

      // -------------------- Sheet 1: Entries --------------------
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entriesSheet = raw.map((e: any) => ({
        ID: e.id,
        "Transaction Date": e.transactionDate
          ? new Date(e.transactionDate).toLocaleDateString()
          : "",
        "Transaction Type": e.transactionType || "",
        Amount: e.amount || "",
        "Debit/Credit": e.debitCredit || "",
        Description: e.description || "",
        ...(e.student
          ? {
              "Student Name": e.student?.name || "",
              "Student Admission No": e.student?.admissionNo || "",
              "Batch Name": e.student?.currentBatch?.name || "",
            }
          : {}),
        ...(e.director
          ? {
              "Director Name": e.director?.name || "",
              "Director Email": e.director?.email || "",
            }
          : {}),
        "Created At": e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
      }));

      // -------------------- Sheet 2: Totals --------------------
      const totalsSheet = [
        { Label: "Students Paid", Value: totals.studentsPaid || 0 },
        { Label: "Office Expense", Value: totals.officeExpense || 0 },
        { Label: "Owner Taken", Value: totals.ownerTaken || 0 },
        { Label: "Opening Balance", Value: totals.openingBalance || 0 },
        { Label: "Closing Balance", Value: totals.closingBalance || 0 },
        { Label: "Cash In Hand", Value: totals.cashInHand || 0 },
        { Label: "Total Debit", Value: totals.totalDebit || 0 },
        { Label: "Total Credit", Value: totals.totalCredit || 0 },
      ];

      // -------------------- Create Workbook --------------------
      const wb = XLSX.utils.book_new();
      const wsEntries = XLSX.utils.json_to_sheet(entriesSheet);
      const wsTotals = XLSX.utils.json_to_sheet(totalsSheet);

      XLSX.utils.book_append_sheet(wb, wsEntries, "Cashbook Entries");
      XLSX.utils.book_append_sheet(wb, wsTotals, "Totals");

      // -------------------- Export File --------------------
      XLSX.writeFile(wb, "Cashbook_Report.xlsx");

      toast.success("Cashbook exported successfully with totals sheet");
    } catch (err) {
      console.error(err);
      toast.error("Error exporting cashbook");
    }
  };

  const getMonthName = (m: string) => {
    if (m === "ALL") return "All Months";
    const names = [
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
    return names[parseInt(m) - 1] || m;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading cashbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0A1533] text-white  space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">
        {/* DarkVeil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Foreground content */}
        <div className="relative z-10 flex w-full items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Cash Book</h1>
            <p className="text-sm text-gray-300">Track all transactions</p>
          </div>

          <div className="flex gap-2">
            <Button
              className="border border-white hover:bg-white hover:text-black"
              onClick={handleExportCashbook}
              disabled={entries.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {(user?.role === 1 || user?.role === 3) && (
              <Button
                onClick={() => setShowAddEntry(true)}
                disabled={!filters.locationId}
                className="border border-white hover:bg-white hover:text-black"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}

      {user && (
        <EntryDialog
          showAddEntry={showAddEntry}
          setShowAddEntry={setShowAddEntry}
          locationId={filters.locationId}
          directors={directors}
          user={user}
          handleTabChange={setActiveTab}
        />
      )}

      {entryToEdit && user && (
        <EntryDialog
          showAddEntry={showEditDialog}
          setShowAddEntry={setShowEditDialog}
          locationId={entryToEdit.locationId}
          directors={directors}
          isEdit={true}
          existingData={entryToEdit}
          user={user}
          handleTabChange={setActiveTab}
        />
      )}

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-md">{error}</div>
      )}

      {/* Filters */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {user?.role === 1 && (
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, locationId: value }))
                  }
                >
                  <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1533] text-white border-white/20">
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id as string}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, year: value }))
                }
              >
                <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All Years</SelectItem>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={filters.month}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, month: value }))
                }
              >
                <SelectTrigger className="w-35 border-white/30 bg-white/10 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getMonthName((i + 1).toString())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Students Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              ₹{totals.studentsPaid?.toLocaleString("en-IN") || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Office Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">
              ₹{totals.officeExpense?.toLocaleString("en-IN") || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Owner Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">
              ₹{totals.ownerTaken?.toLocaleString("en-IN") || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Closing Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-semibold ${
                (totals.closingBalance || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{totals.closingBalance?.toLocaleString("en-IN") || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cash in Hand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              ₹{totals.cashInHand?.toLocaleString("en-IN") || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className="grid w-full grid-cols-3  bg-white/10 border border-white/10 backdrop-blur-md text-white
"
        >
          <TabsTrigger className="text-white" value="students">
            Students Paid
          </TabsTrigger>
          <TabsTrigger className="text-white" value="expenses">
            Office Expenses
          </TabsTrigger>
          <TabsTrigger className="text-white" value="owner">
            Owner Taken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <TransactionTable
            entries={getFilteredEntries()}
            title="Students Paid"
            emptyMessage="No student payments found"
            handleEdit={handleEdit}
            onDelete={handleDeleteEntry}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <TransactionTable
            entries={getFilteredEntries()}
            title="Office Expenses"
            emptyMessage="No office expenses found"
            handleEdit={handleEdit}
            onDelete={handleDeleteEntry}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="owner">
          <TransactionTable
            entries={getFilteredEntries()}
            title="Owner Taken"
            emptyMessage="No owner withdrawals found"
            handleEdit={handleEdit}
            onDelete={handleDeleteEntry}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination && pagination.totalEntries > 1 && (
        <div className="flex items-center justify-end mt-6 px-4">
          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
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
                  Math.abs(page - pagination.page) <= 1
              )
              .map((page, index, array) => {
                const showEllipsis =
                  index < array.length - 1 && array[index + 1] - page > 1;
                const isActive = pagination.page === page;
                return (
                  <div key={page} className="flex items-center">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
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
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";
import EntryDialog from "@/components/cashbook/EntryDialog";
import TransactionTable from "@/components/cashbook/TransactionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCashbookEntries } from "@/redux/features/cashbook/cashbookSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchCurrentUser } from "@/redux/features/user/userSlice";
import { Download, Filter, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FilterState {
  locationId: string;
  year: string;
  month: string;
  type: string;
  debitCredit: string;
  searchQuery: string;
}

export const CashBookPage = () => {
  const dispatch = useAppDispatch();

  const { entries, totals, pagination, loading, error } = useAppSelector(
    (state) => state.cashbook
  );
  const locations = useAppSelector((state) => state.locations.locations);
  const user = useAppSelector((state) => state.users.currentUser);

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString();

  const [filters, setFilters] = useState<FilterState>({
    locationId: "",
    year: currentYear.toString(),
    month: currentMonth,
    type: "ALL",
    debitCredit: "ALL",
    searchQuery: "",
  });

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  // --------------------- FETCH USER AND LOCATIONS ---------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  // --------------------- AUTO SET LOCATION BASED ON ROLE ---------------------
  useEffect(() => {
    if (!user || locations.length === 0) return;

    let userLocationId = "";

    if (user.role === 1) {
      // admin - can select location manually, default to first location
      userLocationId = locations[0]?.id || "";
    } else {
      // non-admin - use user's location
      userLocationId = user.locationId || user.location?.id || "";
    }

    if (userLocationId && userLocationId !== filters.locationId) {
      setFilters((prev) => ({
        ...prev,
        locationId: userLocationId,
      }));
    }
  }, [user, locations]);

  // --------------------- FETCH CASHBOOK DATA ---------------------
  useEffect(() => {
    if (!filters.locationId) return;

    const fetchParams = {
      locationId: filters.locationId,
      month: filters.month === "ALL" ? undefined : filters.month,
      year: filters.year === "ALL" ? undefined : filters.year,
      transactionType: filters.type === "ALL" ? undefined : filters.type,
      debitCredit:
        filters.debitCredit === "ALL" ? undefined : filters.debitCredit,
      search: filters.searchQuery || undefined,
      page: 1,
      limit: 50, // Increased limit to show more entries
    };

    // Clean up undefined parameters
    (Object.keys(fetchParams) as Array<keyof typeof fetchParams>).forEach(
      (key) => {
        if (fetchParams[key] === undefined) {
          delete fetchParams[key];
        }
      }
    );

    dispatch(getCashbookEntries(fetchParams));
  }, [
    dispatch,
    filters.locationId,
    filters.month,
    filters.year,
    filters.type,
    filters.debitCredit,
    filters.searchQuery,
  ]);

  // --------------------- HANDLE TAB CHANGE ---------------------
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Map tab to transaction type
    const tabToTypeMap: { [key: string]: string } = {
      students: "STUDENT_PAID",
      expenses: "OFFICE_EXPENSE",
      owner: "OWNER_TAKEN",
    };

    const transactionType = tabToTypeMap[tab] || "ALL";

    setFilters((prev) => ({
      ...prev,
      type: transactionType,
    }));
  };

  // --------------------- HELPER ---------------------
  const getMonthName = (month: string) => {
    if (month === "ALL") return "All Months";
    const monthNames = [
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
    return monthNames[parseInt(month) - 1] || month;
  };

  // --------------------- EXPORT ---------------------
  const handleExport = () => {
    toast.success("Cash book exported successfully");
  };

  // --------------------- FILTERED ENTRIES FOR TABS ---------------------
  const getFilteredEntries = () => {
    if (filters.type === "ALL") {
      // When no type filter is applied, use active tab to filter
      const tabToTypeMap: { [key: string]: string } = {
        students: "STUDENT_PAID",
        expenses: "OFFICE_EXPENSE",
        owner: "OWNER_TAKEN",
      };
      const transactionType = tabToTypeMap[activeTab];
      return entries.filter(
        (entry) => entry.transactionType === transactionType
      );
    }
    return entries;
  };

  const filteredEntries = getFilteredEntries();

  // Show loading state
  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading cashbook entries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Book</h1>
          <p className="text-muted-foreground">
            Track all cash transactions, income, and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Add Entry Modal */}
      <EntryDialog
        showAddEntry={showAddEntry}
        setShowAddEntry={setShowAddEntry}
        locationId={filters.locationId}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Location (admin only) */}
            {user?.role === 1 && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) =>
                    setFilters({ ...filters, locationId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id as string}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters({ ...filters, year: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={filters.month}
                onValueChange={(value) =>
                  setFilters({ ...filters, month: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getMonthName((i + 1).toString())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="STUDENT_PAID">Students Paid</SelectItem>
                  <SelectItem value="OFFICE_EXPENSE">
                    Office Expenses
                  </SelectItem>
                  <SelectItem value="OWNER_TAKEN">Owner Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Debit/Credit */}
            <div className="space-y-2">
              <Label htmlFor="debitCredit">Debit/Credit</Label>
              <Select
                value={filters.debitCredit}
                onValueChange={(value) =>
                  setFilters({ ...filters, debitCredit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CREDIT">Credit (Income)</SelectItem>
                  <SelectItem value="DEBIT">Debit (Expense)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search description..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totals Summary Card */}

      <div className="grid gap-4 md:grid-cols-5">
        {/* student paid */}
        <Card className="bg-gradient-to-br from-green-50/10 to-green-100/20 border-green-200/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-200">
              Students Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white">
              ₹{totals.studentPaid?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-white mt-1">Credit</p>
          </CardContent>
        </Card>
        {/* office expense */}
        <Card className="bg-gradient-to-br from-blue-50/10 to-blue-100/20 border-blue-200/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-200">
              Office Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white">
              ₹ {totals.officeExpense?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-white mt-1">Debit</p>
          </CardContent>
        </Card>
        {/* owner taken */}
        <Card className="bg-gradient-to-br from-yellow-50/10 to-yellow-100/20 border-yellow-200/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-200">
              Owner Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white">
              ₹ {totals.ownerTaken?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-white mt-1">Debit</p>
          </CardContent>
        </Card>
        {/* closing */}
        <Card className="bg-gradient-to-br from-purple-50/10 to-purple-100/20 border-purple-200/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-200">
              {getMonthName(filters.month)}
              Closing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white">
              ₹ {totals.closingBalance?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-white mt-1">Balance</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50/10 to-orange-100/20 border-orange-200/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-200 ">
              Cash in Hand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white">₹{totals.closingBalance}</div>
            <p className="text-xs text-white mt-1">Current</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs (transactions) */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Students Paid</TabsTrigger>
          <TabsTrigger value="expenses">Office Expenses</TabsTrigger>
          <TabsTrigger value="owner">Owner Taken</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <TransactionTable
            entries={filteredEntries}
            title="Students Paid"
            description="All student fee payments received"
            emptyMessage="No student payments found"
            colorClass="bg-green-50"
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <TransactionTable
            entries={filteredEntries}
            title="Office Expenses"
            description="All office and operational expenses"
            emptyMessage="No office expenses found"
            colorClass="bg-red-50"
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="owner" className="space-y-4">
          <TransactionTable
            entries={filteredEntries}
            title="Owner Taken"
            description="All director/owner withdrawals"
            emptyMessage="No owner withdrawals found"
            colorClass="bg-amber-50"
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {entries.length} of {pagination.totalEntries} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      page: pagination.page - 1,
                    }));
                  }}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      page: pagination.page + 1,
                    }));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

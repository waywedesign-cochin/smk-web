"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Search,
  Building2,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { fetchCurrentUser } from "@/redux/features/user/userSlice";
import DarkVeil from "../DarkVeil";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { fetchBankTransactions } from "@/redux/features/bankTransactions/bankTransactionSlice";
import { fetchBankAccounts } from "@/redux/features/bank/bankSlice";
import { Badge } from "../ui/badge";

export default function BankTransactionsPage() {
  const dispatch = useAppDispatch();
  const { locations } = useAppSelector((s) => s.locations);
  const { currentUser } = useAppSelector((s) => s.users);
  const { transactions, totals, pagination, loading } = useAppSelector(
    (s) => s.bankTransactions
  );

  const bankAccounts = useAppSelector((s) => s.bank.bankAccounts);

  const [filters, setFilters] = useState({
    locationId:  "ALL",
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    bankAccountId: "",
    search: "",
    transactionType: "",
    transactionMode: "",
    category: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  //fetch transactions
  const getTransactions = async () => {
    await dispatch(
      fetchBankTransactions({
        ...filters,
        page: 1,
        limit: pagination?.limit,
        locationId:
          filters.locationId === "ALL" ? undefined : filters.locationId,
        transactionType:
          filters.transactionType === "ALL"
            ? undefined
            : filters.transactionType,
        transactionMode:
          filters.transactionMode === "ALL"
            ? undefined
            : filters.transactionMode,
        category: filters.category === "ALL" ? undefined : filters.category,
        search: debouncedSearch,
      })
    );
  };

  useEffect(() => {
    if (!locations.length) dispatch(fetchLocations());
    if (!currentUser?.id) dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handlePageChange = async (page: number) => {
    await dispatch(
      fetchBankTransactions({
        ...filters,
        page,
        limit: pagination?.limit,
        transactionType:
          filters.transactionType === "ALL"
            ? undefined
            : filters.transactionType,
        transactionMode:
          filters.transactionMode === "ALL"
            ? undefined
            : filters.transactionMode,
        category: filters.category === "ALL" ? undefined : filters.category,
        search: debouncedSearch,
      })
    );
  };

  useEffect(() => {
    getTransactions();
  }, [
    filters.bankAccountId,
    filters.month,
    filters.year,
    filters.locationId,
    debouncedSearch,
    filters.transactionType,
    filters.transactionMode,
    filters.category,
  ]);

  useEffect(() => {
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-2 space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between border border-white/10 rounded-2xl p-4 shadow-xl overflow-hidden">
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>

        <div className="relative z-10 flex w-full items-center justify-between p-1">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Bank Transactions</h1>
            <p className="text-sm text-gray-300">
              Track all bank-related transactions
            </p>
          </div>

          {/* <Button className="border border-white hover:bg-white hover:text-black">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button> */}
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-xl text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-400" />
            Bank Accounts
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="relative group rounded-2xl p-5 bg-gradient-to-br from-[#0f172a]/80 to-[#1e293b]/60 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition" />

                <div className="relative space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base tracking-wide">
                      {account.bankName}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-300">
                      Active
                    </span>
                  </div>

                  {/* Account Number */}
                  <div className="text-xs text-gray-300 tracking-wide">
                    A/C: {account.accountNumber}
                  </div>

                  {/* Balance */}
                  {account.balance && (
                    <div className="pt-2">
                      <div className="text-2xl font-bold text-emerald-400">
                        ₹ {account.balance.toLocaleString() ?? 0}
                      </div>
                      <p className="text-xs text-gray-400">Current Balance</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {/* Total Credits */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
              <ArrowDownCircle className="h-4 w-4" />
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-300">
              ₹{(totals?.totalCredit ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-300 mt-1">Money received</p>
          </CardContent>
        </Card>

        {/* Total Debits */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-400">
              <ArrowUpCircle className="h-4 w-4" />
              Total Debits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-300">
              ₹{(totals?.totalDebit ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-300 mt-1">Money spent</p>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
              <TrendingUp className="h-4 w-4" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-semibold ${
                totals?.balance >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              ₹{(totals?.balance ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-300 mt-1">For filtered period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Location */}
            {currentUser?.role === 1 && (
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, locationId: value }))
                  }
                >
                  <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1533] text-white border-white/20">
                    <SelectItem value="ALL">All Locations</SelectItem>
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
              <Label>Year</Label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, year: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All Years</SelectItem>
                  {Array.from(
                    { length: 6 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={filters.month}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, month: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={filters.bankAccountId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, bankAccountId: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={filters.transactionType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, transactionType: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Mode</Label>
              <Select
                value={filters.transactionMode}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, transactionMode: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1533] text-white border-white/20">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="STUDENT_PAYMENT">
                    Students Payment
                  </SelectItem>
                  <SelectItem value="PAYMENT_TO_DIRECTOR">
                    Payment To Director
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2 lg:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search description..."
                  className="pl-9 bg-white/10 border-white/20 text-white"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-transparent border-none p-0">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <Table className="min-w-full divide-y divide-gray-200/10 ">
              <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
                <TableRow className="bg-black border-none">
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Transaction ID
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Transaction Type
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Transaction Mode
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="px-2 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Bank
                  </TableHead>
                  <TableHead className="px-2 py-2 text-right text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-6 text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Loading transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((t) => (
                    <TableRow
                      key={t.id}
                      className="border-b border-white/5 hover:bg-white/10 transition"
                    >
                      <TableCell className="text-sm text-gray-300 whitespace-nowrap">
                        {new Date(t.transactionDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </TableCell>

                      <TableCell className="text-gray-200">
                        {t.transactionId}
                      </TableCell>
                      <TableCell className="font-medium">
                        <p
                          className={`${
                            t.transactionType === "DEBIT"
                              ? "bg-red-500"
                              : "bg-green-500"
                          } text-white w-fit py-1 px-2  rounded-sm`}
                        >
                          {t.transactionType}
                        </p>
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {t.transactionMode}
                      </TableCell>

                      <TableCell className="text-gray-200">
                        {t.category}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {t.description}
                      </TableCell>

                      <TableCell className="font-semibold text-gray-100 whitespace-nowrap">
                        {bankAccounts.find((b) => b.id === t.bankAccountId)
                          ?.bankName || "-"}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-gray-100 whitespace-nowrap">
                        ₹ {t.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2">
          {/* Page info */}
          <span className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="bg-black/40 border border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="px-3 py-1 rounded-md bg-black/40 border border-white/10 text-xs text-gray-200">
              {pagination.page} / {pagination.totalPages}
            </div>

            <Button
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="bg-black/40 border border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

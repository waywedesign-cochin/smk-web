"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchDirectorLedgerEntries,
  setFilters,
} from "@/redux/features/directorledger/directorSlice";
import { Label } from "../ui/label";
import { User } from "@/lib/types";
import { Search } from "lucide-react";

interface LedgerFiltersProps {
  directorId: string;
  onDirectorChange?: (id: string) => void;
  userRole?: number;
  currentUserDirectorId?: string;
}

const MONTHS = [
  { value: "all-months", label: "All Months" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i).toLocaleString("default", { month: "long" }),
  })),
];

const TRANSACTION_TYPES = [
  { value: "all-types", label: "All Types" },
  { value: "STUDENT_PAID", label: "Student Paid" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
  { value: "OWNER_TAKEN", label: "Cash Withdrawn" },
  { value: "INSTITUTION_GAVE_BANK", label: "To Bank" },
];

export function LedgerFilters({
  directorId,
  onDirectorChange,
  userRole,
  currentUserDirectorId,
}: LedgerFiltersProps) {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);
  const [month, setMonth] = useState("all-months");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("all-types");
  const [selectedDirector, setSelectedDirector] = useState(directorId);

  const showDirectorFilter = userRole === 1 || userRole === 3;
  const directorsList = useMemo(() => {
    if (!showDirectorFilter || !users) return [];
    return users
      .filter((user: User) => user.role === 2)
      .map((user: User) => ({
        value: user.id,
        label: user.username || `Director ${user.id}`,
      }));
  }, [users, showDirectorFilter]);
  console.log("directorsList", directorsList);

  useEffect(() => {
    setSelectedDirector(directorId);
  }, [directorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchDirectorLedgerEntries({
          // locationId,
          directorId: selectedDirector,
          month: month !== "all-months" ? month : undefined,
          year: year || undefined,
          search: search || undefined,
          transactionType:
            transactionType !== "all-types" ? transactionType : undefined,
        })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [month, year, search, transactionType, dispatch, selectedDirector]);

  const handleDirectorChange = (value: string) => {
    setSelectedDirector(value);
    onDirectorChange?.(value);
  };

  return (
    <div className="bg-white/10 border rounded-2xl border-white/10 backdrop-blur-md text-white p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {showDirectorFilter && directorsList.length > 0 && (
          <div className="space-y-2">
            <Label>Director</Label>
            <Select
              value={selectedDirector}
              onValueChange={handleDirectorChange}
            >
              <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
                <SelectValue placeholder="Select director" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1533] text-white border-white/20">
                {directorsList.map((d: { value: string; label: string }) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0A1533] text-white border-white/20">
              <SelectItem value="ALL">All Years</SelectItem>
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i + 5
              ).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label> Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A1533] text-white border-white/20">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>

          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-full border-white/30 bg-white/10 text-white h-10">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A1533] text-white border-white/20">
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className={
            showDirectorFilter
              ? "md:col-span-2 relative "
              : "md:col-span-2 relative "
          }
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />

          <Input
            placeholder="Search description..."
            value={search}
            id="search"
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

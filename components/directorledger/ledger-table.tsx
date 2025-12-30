"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  deleteDirectorLedgerEntry,
  DirectorLedgerEntry,
  fetchDirectorLedgerEntries,
} from "@/redux/features/directorledger/directorSlice";
import { useAppDispatch } from "@/lib/hooks";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { Edit } from "lucide-react";
import { fetchStudents } from "@/redux/features/student/studentSlice";

interface LedgerTableProps {
  entries: DirectorLedgerEntry[];
  onEdit?: (entry: DirectorLedgerEntry) => void;
  directorId: string;
  canEdit: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  totalEntries?: number;
  length?: number;
}
const TYPE_LABELS: Record<string, string> = {
  STUDENT_PAID: "Student Paid",
  OTHER_EXPENSE: "Other Expense",
  OWNER_TAKEN: "Cash in Hand",
  INSTITUTION_GAVE_BANK: "To Director Bank",
};

const TYPE_COLORS: Record<string, string> = {
  STUDENT_PAID: "bg-blue-100 text-blue-900",
  OTHER_EXPENSE: "bg-red-100 text-red-900",
  OWNER_TAKEN: "bg-green-100 text-green-900",
  INSTITUTION_GAVE_BANK: "bg-purple-100 text-purple-900",
};

export function LedgerTable({
  entries,
  onEdit,
  canEdit = true,
  directorId,
  currentPage,
  totalPages,
  onPageChange,
  totalEntries,
  length,
}: LedgerTableProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (id: string) => {
    await dispatch(deleteDirectorLedgerEntry(id)).unwrap();
    await dispatch(
      fetchDirectorLedgerEntries({ page: currentPage, directorId })
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
      <Table className="min-w-full divide-y divide-gray-200/10">
        <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
          <TableRow className="bg-black border-none">
            <TableHead className="px-3 py-1 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="px-3 py-1 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Description
            </TableHead>
            <TableHead className="px-3 py-1 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Ref. id
            </TableHead>
            <TableHead className="px-3 py-1 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Type
            </TableHead>
            <TableHead className="px-3 py-1  text-xs font-medium text-gray-50 uppercase tracking-wider text-right">
              Amount
            </TableHead>
            <TableHead className="px-3 py-1 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              D/C
            </TableHead>
            {canEdit && (
              <TableHead className="px-3 py-1 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-slate-500"
              >
                No entries found
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id} className=" border-b border-slate-100">
                <TableCell className="text-sm">
                  {new Date(entry.transactionDate).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap text-gray-200">
                  {entry.description}{" "}
                  {entry.transactionType === "STUDENT_PAID" && (
                    <span className="p-0.5 rounded text-[8px] font-semibold bg-blue-100/10 text-blue-100">
                      {entry?.student?.name}(
                      {entry?.student?.currentBatch?.name})
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap text-gray-200">
                  {entry.referenceId || "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      TYPE_COLORS[entry.transactionType]
                    }`}
                  >
                    {TYPE_LABELS[entry.transactionType]}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap text-gray-200">
                  {entry.amount.toLocaleString()} ₹
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.debitCredit === "DEBIT"
                        ? "bg-red-100 text-red-900"
                        : "bg-green-100 text-green-900"
                    }`}
                  >
                    {entry.debitCredit}
                  </span>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-center space-x-2">
                    <div className="flex justify-end space-x-2">
                      {entry.transactionType !== "OWNER_TAKEN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(entry)}
                          className="border-white/10 text-black hover:bg-white/80"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {entry.transactionType !== "OWNER_TAKEN" && (
                        <DeleteDialogue
                          id={entry.id}
                          handelDelete={handleDelete}
                          title={"this Entry"}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/10 p-4 rounded-b-lg mt-2">
          <div>
            {" "}
            <p className="text-sm text-white">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{length}</span> of{" "}
              <span className="font-semibold">{totalEntries}</span> entries
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

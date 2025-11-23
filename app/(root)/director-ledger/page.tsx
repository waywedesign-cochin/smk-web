"use client";

import { useEffect, useMemo, useState } from "react";
import { LedgerSummary } from "@/components/directorledger/ledger-summary";
import { LedgerFilters } from "@/components/directorledger/ledger-filters";
import { LedgerTable } from "@/components/directorledger/ledger-table";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  DirectorLedgerEntry,
  fetchDirectorLedgerEntries,
} from "@/redux/features/directorledger/directorSlice";
import { User } from "@/lib/types";
import { fetchUsers } from "@/redux/features/user/userSlice";
import { EntryDialog } from "@/components/directorledger/entry-dialog";
import DarkVeil from "@/components/DarkVeil";
// import DarkVeil from "@/components/DarkVeil";

export default function DirectorLedgerPage() {
  const dispatch = useAppDispatch();
  const { entries, totals, loading, error, pagination } = useAppSelector(
    (state) => state.directorLedger
  );
  const { currentUser, users } = useAppSelector((state) => state.users);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users]);
  const directorsList = useMemo(() => {
    if (!users) return [];

    return users.filter((user: User) => user.role === 2);
  }, [users]);

  const defaultDirectorId = useMemo(() => {
    if (currentUser?.role === 2) {
      // If current user is a director, use their own ID
      return currentUser.id;
    }
    // If admin or staff, use first director's ID
    return directorsList.length > 0 ? directorsList[0].id : "1";
  }, [currentUser, directorsList]);

  const [directorId, setDirectorId] = useState(defaultDirectorId);

  useEffect(() => {
    setDirectorId(defaultDirectorId);
  }, [defaultDirectorId]);
  const [editingEntry, setEditingEntry] = useState<DirectorLedgerEntry | null>(
    null
  );
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const canEdit = currentUser?.role === 1 || currentUser?.role === 3;
  const isDirector = currentUser?.role === 2;

  useEffect(() => {
    dispatch(
      fetchDirectorLedgerEntries({
        directorId,
        page: pagination.page,
      })
    );
  }, [dispatch, directorId, pagination.page]);

  const handleEdit = (entry: DirectorLedgerEntry) => {
    setEditingEntry(entry);
    setEntryDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEntryDialogOpen(false);
    setEditingEntry(null);
  };

  const handlePageChange = (page: number) => {
    dispatch(
      fetchDirectorLedgerEntries({
        directorId,
        page,
      })
    );
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-md text-white p-2 space-y-6">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">
              {" "}
              Director Ledger
            </h1>
            <p className="text-sm text-gray-300">
              Manage transaction entries and view financial summaries{" "}
            </p>
          </div>
          {canEdit &&
            month === (new Date().getMonth() + 1).toString() &&
            year === new Date().getFullYear().toString() && (
              <EntryDialog
                directorId={directorId}
                periodBalance={totals?.periodBalance || 0}
                onSuccess={() => {
                  setEditingEntry(null);
                  dispatch(fetchDirectorLedgerEntries({ directorId }));
                }}
              />
            )}
        </div>
      </div>

      <div className="container mx-auto  space-y-6">
        {/* Header with Add Button */}

        {/* Filters */}
        <LedgerFilters
          directorId={directorId}
          onDirectorChange={isDirector ? undefined : setDirectorId}
          userRole={currentUser?.role}
          currentUserDirectorId={currentUser?.id}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
        />
        <LedgerSummary totals={totals} />

        {/* Table Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12  rounded-lg border bg-white/10">
            <div className="text-center space-y-2">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600">Loading entries...</p>
            </div>
          </div>
        ) : (
          <>
            <LedgerTable
              entries={entries}
              canEdit={canEdit}
              onEdit={handleEdit}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              length={entries.length}
              totalEntries={pagination.totalEntries}
            />
          </>
        )}
      </div>
      <EntryDialog
        directorId={directorId}
        entry={editingEntry}
        open={entryDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={() => {
          setEditingEntry(null);
          dispatch(fetchDirectorLedgerEntries({ directorId }));
        }}
        trigger={false}
        periodBalance={totals?.periodBalance || 0}
      />
    </div>
  );
}

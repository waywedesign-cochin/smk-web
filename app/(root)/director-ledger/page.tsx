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

export default function DirectorLedgerPage() {
  const dispatch = useAppDispatch();
  const { entries, totals, loading, error, pagination } = useAppSelector(
    (state) => state.directorLedger
  );
  const { currentUser, users } = useAppSelector((state) => state.users);
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
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0A1533] text-white p-2 space-y-6">
      <div className="container mx-auto  space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="space-y-2">
            <h1 className="text-3xl max-sm:text-xl font-semibold text-white">
              Director Ledger
            </h1>
            <p className="text-sm max-sm:text-xs text-gray-300">
              Manage transaction entries and view financial summaries
            </p>
          </div>
          {canEdit && <EntryDialog directorId={directorId} />}
        </div>
        <LedgerSummary totals={totals} />

        {/* Filters */}
        <LedgerFilters
          directorId={directorId}
          onDirectorChange={isDirector ? undefined : setDirectorId}
          userRole={currentUser?.role}
          currentUserDirectorId={currentUser?.id}
        />

        {/* Table Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border bg-white/10">
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
      />
    </div>
  );
}

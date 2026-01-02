"use client";
import { useCallback, useEffect, useRef } from "react";
import React from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { fetchStudents } from "@/redux/features/student/studentSlice";
import { fetchUsers } from "@/redux/features/user/userSlice";

import type { CashbookEntry } from "@/redux/features/cashbook/cashbookSlice";
import type { Batch, Student, User } from "@/lib/types";

interface UseCashbookFormProps {
  isOpen: boolean;
  isEdit: boolean;
  existingData?: CashbookEntry | null;
  transactionType:
    | "STUDENT_PAID"
    | "OFFICE_EXPENSE"
    | "OWNER_TAKEN"
    | "OTHER_INCOME"
    | "OTHER_EXPENSE";
  locationId: string;
}

interface UseCashbookFormReturn {
  batches: Batch[];
  filteredStudents: Student[];
  directors: User[];
  loadingBatches: boolean;
  loadingStudents: boolean;
  loadingDirectors: boolean;
  selectedBatchId: string | undefined;
  selectedStudentId: string | undefined;
  setSelectedBatchId: (id: string | undefined) => void;
  setSelectedStudentId: (id: string | undefined) => void;
  resetFormState: () => void;
}

/**
 * Custom hook to manage cascading selection logic for Cashbook form
 * Handles: Location → Batch → Student → Director flow
 * Prevents unnecessary API calls and manages loading states cleanly
 */
export function useCashbookForm({
  isOpen,
  isEdit,
  existingData,
  transactionType,
  locationId,
}: UseCashbookFormProps): UseCashbookFormReturn {
  const dispatch = useAppDispatch();

  // 🔹 Redux data
  const batches = useAppSelector((state) => state.batches.batches ?? []);
  const students = useAppSelector((state) => state.students.students ?? []);
  const users = useAppSelector((state) => state.users.users ?? []);

  // 🔹 Derived
  const directors = users.filter((user) => user.role === 2);

  // 🔹 Refs to prevent redundant fetches
  const fetchedBatchesForLocation = useRef<string | null>(null);
  const fetchedStudentsForBatch = useRef<string | null>(null);
  const fetchedDirectors = useRef<boolean>(false);

  // 🔹 Local state
  const [selectedBatchId, setSelectedBatchId] = React.useState<
    string | undefined
  >(undefined);
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    string | undefined
  >(undefined);

  const [loadingBatches, setLoadingBatches] = React.useState(false);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [loadingDirectors, setLoadingDirectors] = React.useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      fetchedBatchesForLocation.current = null;
      fetchedStudentsForBatch.current = null;
      fetchedDirectors.current = false;
      setSelectedBatchId(undefined);
      setSelectedStudentId(undefined);
    }
  }, [isOpen]);

  // When editing, restore student context if needed
  useEffect(() => {
    if (isEdit && existingData && transactionType === "STUDENT_PAID") {
      const batchId = existingData.student?.currentBatchId;
      const studentId = existingData.studentId;
      if (batchId) setSelectedBatchId(batchId);
      if (studentId) setSelectedStudentId(studentId);
    }
  }, [isEdit, existingData, transactionType]);

  useEffect(() => {
    if (!isOpen || transactionType !== "STUDENT_PAID" || !locationId) return;

    const loadBatches = async () => {
      setLoadingBatches(true);
      try {
        await dispatch(
          fetchBatches({
            location: locationId,
            limit: 10,
            status: "ACTIVE",
          })
        ).unwrap();
      } catch (error) {
        console.error("❌ Failed to fetch batches:", error);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [isOpen, transactionType, locationId, dispatch]);

  // 🔹 Fetch students when batch changes
  useEffect(() => {
    if (
      !isOpen ||
      transactionType !== "STUDENT_PAID" ||
      !selectedBatchId ||
      !locationId ||
      fetchedStudentsForBatch.current === selectedBatchId
    )
      return;

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        await dispatch(
          fetchStudents({
            batch: selectedBatchId,
            location: locationId,
            page: 1,
            limit: 200,
          })
        ).unwrap();
        fetchedStudentsForBatch.current = selectedBatchId;
      } catch (error) {
        console.error("❌ Failed to fetch students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isOpen, transactionType, selectedBatchId, locationId, dispatch]);

  // 🔹 Fetch directors when type = OWNER_TAKEN
  useEffect(() => {
    if (
      !isOpen ||
      transactionType !== "OWNER_TAKEN" ||
      fetchedDirectors.current
    )
      return;

    const loadDirectors = async () => {
      setLoadingDirectors(true);
      try {
        await dispatch(fetchUsers()).unwrap();
        fetchedDirectors.current = true;
      } catch (error) {
        console.error("❌ Failed to fetch directors:", error);
      } finally {
        setLoadingDirectors(false);
      }
    };

    loadDirectors();
  }, [isOpen, transactionType, dispatch]);

  // 🔹 Filter students for selected batch
  const filteredStudents = useCallback(() => {
    if (transactionType !== "STUDENT_PAID" || !selectedBatchId) return [];
    return students.filter((s) => s.currentBatch?.id === selectedBatchId);
  }, [students, selectedBatchId, transactionType]);

  // 🔹 Reset helper
  const resetFormState = useCallback(() => {
    setSelectedBatchId(undefined);
    setSelectedStudentId(undefined);
    fetchedBatchesForLocation.current = null;
    fetchedStudentsForBatch.current = null;
    fetchedDirectors.current = false;
  }, []);

  return {
    batches: transactionType === "STUDENT_PAID" ? batches : [],
    filteredStudents: filteredStudents(),
    directors: transactionType === "OWNER_TAKEN" ? directors : [],
    loadingBatches,
    loadingStudents,
    loadingDirectors,
    selectedBatchId,
    selectedStudentId,
    setSelectedBatchId,
    setSelectedStudentId,
    resetFormState,
  };
}

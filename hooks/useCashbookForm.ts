"use client";
import { useCallback, useEffect, useRef } from "react";
import React from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { fetchStudents } from "@/redux/features/student/studentSlice";
import type { CashbookEntry } from "@/redux/features/cashbook/cashbookSlice";
import type { Batch, Student } from "@/lib/types";

interface UseCashbookFormProps {
  isOpen: boolean;
  isEdit: boolean;
  existingData?: CashbookEntry | null;
  transactionType: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  locationId: string;
}

interface UseCashbookFormReturn {
  batches: Batch[];
  filteredStudents: Student[];
  loadingBatches: boolean;
  loadingStudents: boolean;
  selectedBatchId: string | undefined;
  selectedStudentId: string | undefined;
  setSelectedBatchId: (id: string | undefined) => void;
  setSelectedStudentId: (id: string | undefined) => void;
  resetFormState: () => void;
}

/**
 * Custom hook to manage cascading selection logic for cashbook form
 * Handles: Location → Batch → Student flow
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
  const batches = useAppSelector((state) => state.batches.batches ?? []);
  const students = useAppSelector((state) => state.students.students ?? []);

  // Track what we've already fetched to avoid duplicate API calls
  const fetchedBatchesForLocation = useRef<string | null>(null);
  const fetchedStudentsForBatch = useRef<string | null>(null);

  const [selectedBatchId, setSelectedBatchId] = React.useState<
    string | undefined
  >(undefined);
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    string | undefined
  >(undefined);
  const [loadingBatches, setLoadingBatches] = React.useState(false);
  const [loadingStudents, setLoadingStudents] = React.useState(false);

  useEffect(() => {
    if (!isOpen) {
      fetchedBatchesForLocation.current = null;
      fetchedStudentsForBatch.current = null;
      setSelectedBatchId(undefined);
      setSelectedStudentId(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEdit && existingData && transactionType === "STUDENT_PAID") {
      const batchId = existingData.student?.currentBatchId;
      const studentId = existingData.studentId;

      if (batchId) {
        setSelectedBatchId(batchId);
      }
      if (studentId) {
        setSelectedStudentId(studentId);
      }
    }
  }, [isEdit, existingData, transactionType]);

  useEffect(() => {
    if (
      !isOpen ||
      transactionType !== "STUDENT_PAID" ||
      !locationId ||
      fetchedBatchesForLocation.current === locationId
    ) {
      return;
    }

    const loadBatches = async () => {
      setLoadingBatches(true);
      try {
        await dispatch(fetchBatches({ location: locationId })).unwrap();
        fetchedBatchesForLocation.current = locationId;
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [isOpen, transactionType, locationId, dispatch]);

  useEffect(() => {
    if (
      !isOpen ||
      transactionType !== "STUDENT_PAID" ||
      !selectedBatchId ||
      !locationId ||
      fetchedStudentsForBatch.current === selectedBatchId
    ) {
      return;
    }

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
        console.error("Failed to fetch students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isOpen, transactionType, selectedBatchId, locationId, dispatch]);

  const filteredStudents = useCallback(() => {
    if (transactionType !== "STUDENT_PAID" || !selectedBatchId) {
      return [];
    }
    return students.filter((s) => s.currentBatch?.id === selectedBatchId);
  }, [students, selectedBatchId, transactionType]);
  const resetFormState = useCallback(() => {
    setSelectedBatchId(undefined);
    setSelectedStudentId(undefined);
    fetchedBatchesForLocation.current = null;
    fetchedStudentsForBatch.current = null;
  }, []);
  return {
    batches: transactionType === "STUDENT_PAID" ? batches : [],
    filteredStudents: filteredStudents(),
    loadingBatches,
    loadingStudents,
    selectedBatchId,
    selectedStudentId,
    setSelectedBatchId,
    setSelectedStudentId,
    resetFormState,
  };
}

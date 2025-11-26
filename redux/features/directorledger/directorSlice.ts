import { BankTransaction, Student } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

/* ------------------- Types ------------------- */
export interface DirectorLedgerEntry {
  id: string;
  transactionDate: Date;
  amount: number;
  transactionType:
    | "STUDENT_PAID"
    | "OTHER_EXPENSE"
    | "OWNER_TAKEN"
    | "INSTITUTION_GAVE_BANK";
  debitCredit: "DEBIT" | "CREDIT";
  description: string;
  bankAccountId?: string;
 bankTransaction:BankTransaction | null;
  locationId: string;
  referenceId?: string;
  studentId?: string;
  directorId: string;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    name: string;
    id: string;
    currentBatchId: string;
    currentBatch: {
      name: string;
    };
  } | null;
}

export interface DirectorLedgerTotals {
  studentsPaid: number;
  otherExpenses: number;
  cashInHand: number;
  institutionGaveBank: number;
  totalDebit: number;
  totalCredit: number;
  periodBalance: number;
}

export interface DirectorLedgerFilters {
  directorId: string;
  month?: string;
  year?: string;
  search?: string;
  transactionType?: string;
  debitCredit?: string;
}

export interface DirectorLedgerPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalEntries: number;
}

export interface DirectorLedgerState {
  entries: DirectorLedgerEntry[];
  totals: DirectorLedgerTotals | null;
  pagination: DirectorLedgerPagination;
  filters: DirectorLedgerFilters;
  loading: boolean;
  error: string | null;
}

/* ------------------- Initial State ------------------- */
const initialState: DirectorLedgerState = {
  entries: [],
  totals: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalEntries: 0,
  },
  filters: {
    directorId: "",
  },
  loading: false,
  error: null,
};

/* ------------------- Async Thunks ------------------- */

// ✅ Fetch ledger entries
export const fetchDirectorLedgerEntries = createAsyncThunk(
  "directorLedger/fetchEntries",
  async (
    filters: DirectorLedgerFilters & { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/director-ledger/entries`,
        {
          params: {
            page: filters.page ?? 1,
            limit: filters.limit ?? 10,
            ...filters,
          },
        }
      );

      return response.data.data as {
        entries: DirectorLedgerEntry[];
        totals: DirectorLedgerTotals | null;
        pagination: DirectorLedgerPagination;
      };
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch entries";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Add a new entry
export const addDirectorLedgerEntry = createAsyncThunk<
  { data: DirectorLedgerEntry },
  Omit<DirectorLedgerEntry, "id" | "debitCredit" | "createdAt" | "updatedAt">,
  { rejectValue: string }
>("directorLedger/addEntry", async (entry, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    // Determine debit/credit based on type
    const debitCredit: DirectorLedgerEntry["debitCredit"] =
      entry.transactionType === "STUDENT_PAID" ? "CREDIT" : "DEBIT";

    const payload = { ...entry, debitCredit };

    const response = await axios.post(
      `${BASE_URL}/api/director-ledger/add-entry`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { data: response.data.data };
  } catch (error: unknown) {
    let errorMessage = "Failed to add entries";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// ✅ Update an existing entry
export const updateDirectorLedgerEntry = createAsyncThunk<
  { data: DirectorLedgerEntry },
  { id: string; entry: Partial<DirectorLedgerEntry> },
  { rejectValue: string }
>("directorLedger/updateEntry", async ({ id, entry }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${BASE_URL}/api/director-ledger/update-entry/${id}`,
      entry,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { data: response.data.data };
  } catch (error: unknown) {
    let errorMessage = "Failed to update ledger entry";
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue(errorMessage);
  }
});

// ✅ Delete an entry
export const deleteDirectorLedgerEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("directorLedger/deleteEntry", async (id, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/director-ledger/delete-entry/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data.success) {
      toast.success(response.data.message || "Entry deleted successfully");
    }
    return id;
  } catch (error: unknown) {
    let errorMessage = "Failed to delete entry";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/* ------------------- Slice ------------------- */

const directorLedgerSlice = createSlice({
  name: "directorLedger",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<DirectorLedgerFilters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<DirectorLedgerPagination>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch Entries ---------- */
      .addCase(fetchDirectorLedgerEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirectorLedgerEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries;
        state.totals = action.payload.totals;
        state.pagination = action.payload.pagination;
        // Save last used filters
        state.filters = {
          ...state.filters,
          ...action.meta.arg,
        };
      })
      .addCase(fetchDirectorLedgerEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch entries";
      })

      /* ---------- Add Entry ---------- */
      .addCase(addDirectorLedgerEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDirectorLedgerEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload.data);
      })
      .addCase(addDirectorLedgerEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add entry";
      })

      /* ---------- Update Entry ---------- */
      .addCase(updateDirectorLedgerEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDirectorLedgerEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.entries.findIndex(
          (e) => e.id === action.payload.data.id
        );
        if (index !== -1) {
          state.entries[index] = {
            ...state.entries[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(updateDirectorLedgerEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update entry";
      })

      /* ---------- Delete Entry ---------- */
      .addCase(deleteDirectorLedgerEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDirectorLedgerEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = state.entries.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteDirectorLedgerEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete entry";
      });
  },
});

export const { setFilters, setPagination, clearError } =
  directorLedgerSlice.actions;
export default directorLedgerSlice.reducer;

import { BASE_URL } from "@/redux/baseUrl";
import toast from "react-hot-toast";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Student, User } from "@/lib/types";

// ----------------------------------
// Types and Interfaces
// ----------------------------------

export interface CashbookEntry {
  id: string;
  transactionDate: string;
  transactionType: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  amount: number;
  debitCredit: "DEBIT" | "CREDIT";
  description?: string;
  referenceId?: string;
  locationId: string;
  studentId?: string;
  directorId?: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  director?: User;
}

export interface CashbookTotals {
  studentsPaid: number;
  officeExpense: number;
  ownerTaken: number;
  openingBalance: number;
  closingBalance: number;
  cashInHand: number;
  totalCredit: number;
  totalDebit: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalEntries: number;
}

export interface CashbookResponse {
  entries: CashbookEntry[];
  totals: CashbookTotals;
  pagination: Pagination;
}

export interface CashbookState {
  entries: CashbookEntry[];
  totals: CashbookTotals;
  globalTotals: CashbookTotals;
  pagination: Pagination | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export interface FetchCashbookParams {
  locationId: string;
  month?: string;
  year?: string;
  transactionType: string;
  page?: number;
  limit?: number;
}

export interface AddCashbookEntryData {
  transactionDate: string;
  amount: number;
  transactionType: "STUDENT_PAID" | "OFFICE_EXPENSE" | "OWNER_TAKEN";
  description?: string;
  locationId: string;
  referenceId?: string;
  studentId?: string;
  directorId?: string;
}

// ----------------------------------
// Async Thunks
// ----------------------------------

export const fetchCashbookEntries = createAsyncThunk<
  CashbookResponse,
  FetchCashbookParams | undefined
>("cashbook/fetchEntries", async (params, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/api/cashbook/entries`, {
      params: params || {},
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data as CashbookResponse;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch entries";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const fetchGlobalTotals = createAsyncThunk<
  CashbookTotals,
  { locationId: string; year?: string }
>(
  "cashbook/fetchGlobalTotals",
  async ({ locationId, year }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/cashbook/entries`, {
        params: { locationId, year, month: "allmonths" },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data?.totals as CashbookTotals;
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch global totals";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addCashbookEntry = createAsyncThunk<
  CashbookEntry,
  AddCashbookEntryData
>("cashbook/addEntry", async (entryData, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/cashbook/add-entry`,
      entryData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data.success) {
      toast.success(response.data.message || "Entry added successfully");
    }
    return response.data.data as CashbookEntry;
  } catch (error: unknown) {
    let errorMessage = "Failed to add entry";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const updateCashbookEntry = createAsyncThunk<
  CashbookEntry,
  { id: string; data: Partial<CashbookEntry> }
>("cashbook/updateEntry", async ({ id, data }, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${BASE_URL}/api/cashbook/update-entry/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.success) {
      toast.success(response.data.message || "Entry updated successfully");
    }
    return response.data.data as CashbookEntry;
  } catch (error: unknown) {
    let errorMessage = "Failed to update entry";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const deleteCashbookEntry = createAsyncThunk<string, string>(
  "cashbook/deleteEntry",
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/cashbook/delete-entry/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
  }
);

// ----------------------------------
// Initial State
// ----------------------------------

const initialState: CashbookState = {
  entries: [],
  totals: {
    studentsPaid: 0,
    officeExpense: 0,
    ownerTaken: 0,
    openingBalance: 0,
    closingBalance: 0,
    cashInHand: 0,
    totalCredit: 0,
    totalDebit: 0,
  },
  globalTotals: {
    studentsPaid: 0,
    officeExpense: 0,
    ownerTaken: 0,
    openingBalance: 0,
    closingBalance: 0,
    cashInHand: 0,
    totalCredit: 0,
    totalDebit: 0,
  },
  pagination: null,
  loading: false,
  submitting: false,
  error: null,
};

// ----------------------------------
// Slice
// ----------------------------------

const cashbookSlice = createSlice({
  name: "cashbook",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH ENTRIES
    builder
      .addCase(fetchCashbookEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashbookEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries || [];
        state.totals = action.payload.totals || initialState.totals;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchCashbookEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch entries";
      });
    // FETCH GLOBAL TOTALS
    builder
      .addCase(fetchGlobalTotals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalTotals.fulfilled, (state, action) => {
        state.loading = false;
        state.globalTotals = action.payload || initialState.globalTotals;
      })
      .addCase(fetchGlobalTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch global totals";
      });

    // ADD ENTRY
    builder
      .addCase(addCashbookEntry.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addCashbookEntry.fulfilled, (state, action) => {
        state.submitting = false;
        state.entries = [action.payload, ...state.entries];
      })
      .addCase(addCashbookEntry.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to add entry";
      });

    // UPDATE ENTRY
    builder
      .addCase(updateCashbookEntry.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCashbookEntry.fulfilled, (state, action) => {
        state.submitting = false;
        state.entries = state.entries.map((entry) =>
          entry.id === action.payload.id ? action.payload : entry
        );
      })
      .addCase(updateCashbookEntry.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to update entry";
      });

    // DELETE ENTRY
    builder
      .addCase(deleteCashbookEntry.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteCashbookEntry.fulfilled, (state, action) => {
        state.submitting = false;
        state.entries = state.entries.filter(
          (entry) => entry.id !== action.payload
        );
      })
      .addCase(deleteCashbookEntry.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to delete entry";
      });
  },
});

export const { clearError } = cashbookSlice.actions;
export default cashbookSlice.reducer;

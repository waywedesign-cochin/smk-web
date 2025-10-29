import { BASE_URL } from "@/redux/baseUrl";
import toast from "react-hot-toast";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

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
  directorId?: string; // Added this field
  createdAt: string;
  updatedAt: string;
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

export interface CashbookState {
  entries: CashbookEntry[];
  totals: CashbookTotals;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface FetchParams {
  locationId: string;
  month?: string;
  year?: string;
  search?: string;
  transactionType?: string;
  debitCredit?: string;
  page?: number;
  limit?: number;
}

export interface AddCashbookEntryData {
  transactionDate: string; // ISO string format
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

// ➕ Add a Cashbook Entry
export const addCashbookEntry = createAsyncThunk<
  CashbookEntry,
  AddCashbookEntryData,
  { rejectValue: string }
>("cashbook/addCashbookEntry", async (entryData, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/cashbook/add-entry`,
      entryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ); // Fixed endpoint
    if (response.data.success === true) {
      toast.success(response.data.message || "Entry added successfully");
    }
    return response.data.data as CashbookEntry;
  } catch (error: unknown) {
    let errorMessage = "Failed to add cashbook entry"; // Fixed error message
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// 📄 Get Cashbook Entries
export const getCashbookEntries = createAsyncThunk<
  {
    entries: CashbookEntry[];
    totals: CashbookTotals;
    pagination: Pagination;
  },
  FetchParams,
  { rejectValue: string }
>("cashbook/getCashbookEntries", async (params, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${BASE_URL}/api/cashbook/entries`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); // Fixed endpoint
    return response.data.data;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch Cashbook Entries";
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// ✏️ Update Cashbook Entry
export const updateCashbookEntry = createAsyncThunk<
  CashbookEntry,
  { id: string; data: Partial<CashbookEntry> },
  { rejectValue: string }
>("cashbook/updateCashbookEntry", async ({ id, data }, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${BASE_URL}/api/cashbook/update-entry/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success === true) {
      toast.success(response.data.message || "Entry updated successfully");
    }
    return response.data.data as CashbookEntry;
  } catch (error: unknown) {
    let errorMessage = "Failed to update cashbook entry";
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// 🗑️ Delete Cashbook Entry
export const deleteCashbookEntry = createAsyncThunk<
  string, // Return the deleted entry ID
  string, // Accept the entry ID
  { rejectValue: string }
>("cashbook/deleteCashbookEntry", async (id, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/cashbook/delete-entry/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success === true) {
      toast.success(response.data.message || "Entry deleted successfully");
    }
    return id;
  } catch (error: unknown) {
    let errorMessage = "Failed to delete cashbook entry";
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

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
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalEntries: 0,
  },
  loading: false,
  error: null,
  successMessage: null,
};

// ----------------------------------
// Slice
// ----------------------------------

const cashbookSlice = createSlice({
  name: "cashbook",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Entry
      .addCase(addCashbookEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addCashbookEntry.fulfilled,
        (state, action: PayloadAction<CashbookEntry>) => {
          state.loading = false;
          state.successMessage = "Cashbook entry added successfully";
          state.entries.unshift(action.payload);
        }
      )
      .addCase(addCashbookEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error adding entry";
      })

      // Get Entries
      .addCase(getCashbookEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCashbookEntries.fulfilled,
        (
          state,
          action: PayloadAction<{
            entries: CashbookEntry[];
            totals: CashbookTotals;
            pagination: Pagination;
          }>
        ) => {
          state.loading = false;
          state.entries = action.payload.entries || [];
          state.totals = action.payload.totals || initialState.totals;
          state.pagination =
            action.payload.pagination || initialState.pagination;
        }
      )
      .addCase(getCashbookEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching entries";
      })

      // Update Entry
      .addCase(updateCashbookEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCashbookEntry.fulfilled,
        (state, action: PayloadAction<CashbookEntry>) => {
          state.loading = false;
          state.successMessage = "Cashbook entry updated successfully";
          const index = state.entries.findIndex(
            (entry) => entry.id === action.payload.id
          );
          if (index !== -1) {
            state.entries[index] = action.payload;
          }
        }
      )
      .addCase(updateCashbookEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating entry";
      })

      // Delete Entry
      .addCase(deleteCashbookEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCashbookEntry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.successMessage = "Cashbook entry deleted successfully";
          state.entries = state.entries.filter(
            (entry) => entry.id !== action.payload
          );
        }
      )
      .addCase(deleteCashbookEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error deleting entry";
      });
  },
});

export const { clearMessages } = cashbookSlice.actions;
export default cashbookSlice.reducer;

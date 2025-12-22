import { BankTransaction } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// ---------------- STATE TYPES ----------------
interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalEntries: number;
}

interface totals {
  balance: number;
  totalCredit: number;
  totalDebit: number;
}

interface BankTransactionState {
  transactions: BankTransaction[];
  totals: totals;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

interface BankTransactionResponse {
  bankTransactions: BankTransaction[];
  pagination: Pagination;
  totals: totals;
}

interface fetchBankTransactionsParams {
  locationId?: string;
  year?: string;
  month?: string;
  bankAccountId?: string;
  search?: string;
  transactionType?: string;
  transactionMode?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ---------------- INITIAL STATE ----------------
const initialState: BankTransactionState = {
  transactions: [],
  totals: { balance: 0, totalCredit: 0, totalDebit: 0 },
  pagination: null,
  loading: false,
  error: null,
};

// ---------------- THUNKS ----------------
export const fetchBankTransactions = createAsyncThunk<
  BankTransactionResponse,
  fetchBankTransactionsParams | undefined
>("bankTransactions/fetchEntries", async (params, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/bank-transaction/get-bank-transactions`,
      {
        params: {
          ...params,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data as BankTransactionResponse;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch bank transactions"
    );
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch bank transactions"
    );
  }
});

// ---------------- SLICE ----------------
const bankTransactionSlice = createSlice({
  name: "bankTransactions",
  initialState,
  reducers: {
    clearBankTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder;
    // FETCH
    builder
      .addCase(fetchBankTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.bankTransactions;
        state.totals = action.payload.totals;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBankTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default bankTransactionSlice.reducer;

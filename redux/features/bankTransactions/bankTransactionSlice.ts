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

interface addBankTransactionParams {
  transactionDate: Date;
  transactionId?: string;
  amount: number | string;
  description?: string;
  transactionMode: "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  status: "PENDING" | "COMPLETED" | "FAILED";
  category: string | "OTHER_INCOME" | "OTHER_EXPENSE";
  bankAccountId: string;
  locationId: string;
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

export const addBankTransaction = createAsyncThunk<
  BankTransaction,
  addBankTransactionParams
>("bankTransactions/addEntry", async (newBank, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/bank-transaction/add-bank-transaction`,
      newBank,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success === true) {
      toast.success(
        response.data.message || "Bank transaction added successfully"
      );
    }
    return response.data.data as BankTransaction;
  } catch (error: unknown) {
    let errorMessage = "Failed to add bank transaction";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

export const updateBankTransaction = createAsyncThunk<
  BankTransaction,
  addBankTransactionParams & { id: string }
>("bankTransactions/updateEntry", async (updatedBank, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${BASE_URL}/api/bank-transaction/update-bank-transaction/${updatedBank.id}`,
      updatedBank,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);

    if (response.data.success === true) {
      toast.success(
        response.data.message || "Bank transaction updated successfully"
      );
    }
    return response.data.data as BankTransaction;
  } catch (error: unknown) {
    let errorMessage = "Failed to update bank transaction";
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue(errorMessage);
  }
});

export const deleteBankTransaction = createAsyncThunk<BankTransaction, string>(
  "bankTransactions/deleteEntry",
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/bank-transaction/delete-bank-transaction/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(
          response.data.message || "Bank transaction deleted successfully"
        );
      }
      return response.data.data as BankTransaction;
    } catch (error: unknown) {
      let errorMessage = "Failed to delete bank transaction";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

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

    // ADD
    builder
      .addCase(addBankTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(addBankTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // UPDATE
    builder
      .addCase(updateBankTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        );
      })
      .addCase(updateBankTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // DELETE
    builder
      .addCase(deleteBankTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload.id
        );
      })
      .addCase(deleteBankTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default bankTransactionSlice.reducer;

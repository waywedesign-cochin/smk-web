import { BankTransaction } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl"; // Assuming BASE_URL is defined
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// --- Type Definitions ---s
interface BankState {
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;
}

// Assuming your BankAccount type looks something like this (adjust as needed)
type BankAccount = {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance?: number;
  ifscCode: string;
  branch: string;
  bankTransactions?: BankTransaction[];
};

const initialState: BankState = {
  bankAccounts: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

// 1. Add Bank Account
export const addBankAccount = createAsyncThunk<
  BankAccount,
  Omit<BankAccount, "id">
>("bank/add", async (newBank, { rejectWithValue }) => {
  const token = localStorage.getItem("token"); // Assuming token is used
  try {
    const response = await axios.post(
      `${BASE_URL}/api/bank-account/add-bank-account`, // Adjust endpoint if needed
      newBank,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success === true) {
      toast.success(response.data.message || "Bank account added successfully");
    }
    return response.data.data as BankAccount;
  } catch (error: unknown) {
    let errorMessage = "Failed to add bank account";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// 2. Fetch Bank Accounts
export const fetchBankAccounts = createAsyncThunk<BankAccount[]>(
  "bank/fetch",

  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token"); // Assuming token is used

    try {
      const response = await axios.get(
        `${BASE_URL}/api/bank-account/get-bank-accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } // Adjust endpoint if needed
      );
      return response.data.data as BankAccount[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch bank accounts";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// 3. Update Bank Account
export const updateBankAccount = createAsyncThunk<BankAccount, BankAccount>(
  "bank/update",
  async (updatedBank, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${BASE_URL}/api/bank-account/update-bank-account/${updatedBank.id}`, // Adjust endpoint & structure
        updatedBank,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(
          response.data.message || "Bank account updated successfully"
        );
      }
      return response.data.data as BankAccount;
    } catch (error: unknown) {
      let errorMessage = "Failed to update bank account";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// 4. Delete Bank Account
export const deleteBankAccount = createAsyncThunk<string, string>(
  "bank/delete",
  async (bankId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/bank-account/delete-bank-account/${bankId}`, // Adjust endpoint & structure
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(
          response.data.message || "Bank account deleted successfully"
        );
      }
      return bankId; // Return the ID of the deleted item
    } catch (error: unknown) {
      let errorMessage = "Failed to delete bank account";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Bank Slice ---

const bankSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add Bank Account
      .addCase(addBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        // Add new bank account to the beginning of the array
        state.bankAccounts = [action.payload, ...state.bankAccounts];
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to add bank account";
      })

      // Fetch Bank Accounts
      .addCase(fetchBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.bankAccounts = action.payload; // Replace with fetched list
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch bank accounts";
      })

      // Update Bank Account
      .addCase(updateBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        // Find and replace the updated bank account
        state.bankAccounts = state.bankAccounts.map((bank) =>
          bank.id === action.payload.id ? action.payload : bank
        );
      })
      .addCase(updateBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to update bank account";
      })

      // Delete Bank Account
      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out the deleted bank account by ID
        state.bankAccounts = state.bankAccounts.filter(
          (bank) => bank.id !== action.payload
        );
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to delete bank account";
      });
  },
});

export default bankSlice.reducer;

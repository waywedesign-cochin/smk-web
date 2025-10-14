import { Fee } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface FeeUpdate {
  id: string;
  discountAmount?: number;
  feePaymentMode?: string;
}

interface FeeState {
  fee: Fee[];
  loading: boolean;
  error: string | null;
}

const initialState: FeeState = {
  fee: [],
  loading: false,
  error: null,
};

// Update / Configure a single fee
export const configureFee = createAsyncThunk<Fee, FeeUpdate>(
  "fee/configure",
  async (fee: FeeUpdate, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/fee/update-fee/${fee.id}`,
        fee
      );

      if (response.data.success === true) {
        toast.success(response.data.message || "Fee configured successfully");
      }

      return response.data.data as Fee;
    } catch (error: unknown) {
      let errorMessage = "Failed to configure fee";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch all fees by student ID
export const fetchFeeByStudentId = createAsyncThunk<Fee[], string>(
  "fee/fetchByStudentId",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/fee/get-fees/${studentId}`
      );
      return response.data.data as Fee[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch fee details";
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const feeSlice = createSlice({
  name: "fee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Configure Fee
    builder
      .addCase(configureFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(configureFee.fulfilled, (state, action) => {
        state.loading = false;

        // Update the specific fee in the array if it exists, else push
        const updatedFeeIndex = state.fee.findIndex(
          (f) => f.id === action.payload.id
        );
        if (updatedFeeIndex !== -1) {
          state.fee[updatedFeeIndex] = action.payload;
        } else {
          state.fee.push(action.payload);
        }
      })
      .addCase(configureFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Fees by Student
    builder
      .addCase(fetchFeeByStudentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeByStudentId.fulfilled, (state, action) => {
        state.loading = false;
        state.fee = action.payload;
      })
      .addCase(fetchFeeByStudentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default feeSlice.reducer;

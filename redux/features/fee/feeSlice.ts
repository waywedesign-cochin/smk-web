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
  fee: Fee | null;
  loading: boolean;
  error: string | null;
}

const initialState: FeeState = {
  fee: null,
  loading: false,
  error: null,
};

export const cofigureFee = createAsyncThunk<Fee, FeeUpdate>(
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

const feeSlice = createSlice({
  name: "fee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cofigureFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cofigureFee.fulfilled, (state, action) => {
        state.loading = false;
        state.fee = action.payload;
      })
      .addCase(cofigureFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default feeSlice.reducer;

// redux/features/payment/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Payment } from "@/lib/types";
import { PaymentInput } from "@/components/student/Payment/PaymentForm";
import { BASE_URL } from "@/redux/baseUrl";

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
};

// Async thunk: create payment
export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (payment: PaymentInput, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/payment/create-payment`,
        payment
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment"
      );
    }
  }
);

// Async thunk: fetch payments for a student
export const fetchPaymentsByStudent = createAsyncThunk(
  "payment/fetchPaymentsByStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/payments/get-payments/${studentId}`
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.payments = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Payment
    builder.addCase(createPayment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createPayment.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.loading = false;
        state.payments.push(action.payload);
      }
    );
    builder.addCase(
      createPayment.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );

    // Fetch Payments
    builder.addCase(fetchPaymentsByStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPaymentsByStudent.fulfilled,
      (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      }
    );
    builder.addCase(
      fetchPaymentsByStudent.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;

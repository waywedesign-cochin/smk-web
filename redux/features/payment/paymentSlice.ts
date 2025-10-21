// redux/features/payment/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Payment } from "@/lib/types";
import { PaymentInput } from "@/components/student/Payment/PaymentForm";
import { BASE_URL } from "@/redux/baseUrl";
import toast from "react-hot-toast";
import { DueInput } from "@/components/student/Payment/CreateDueForm";

interface PaymentState {
  payments: Payment[];
  loading: boolean; // for fetching payments
  submitting: boolean; // for add/update actions
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  submitting: false,
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
      if (response.data.success === true) {
        toast.success(response.data.message || "Payment added successfully");
      }
      return response.data.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create payment");
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment"
      );
    }
  }
);

// Fetch payments for a student
export const fetchPaymentsByStudent = createAsyncThunk(
  "payment/fetchPaymentsByStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/payment/get-payments/${studentId}`
      );
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

// Update payment
export const updatePayment = createAsyncThunk(
  "payment/updatePayment",
  async (payment: PaymentInput, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/payment/update-payment/${payment.id}`,
        payment
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Payment updated successfully");
      }
      return response.data.data.payment;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update payment");
      return rejectWithValue(
        err.response?.data?.message || "Failed to update payment"
      );
    }
  }
);

//create payment due
export const createPaymentDue = createAsyncThunk(
  "payment/createPaymentDue",
  async (payment: DueInput, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/payment/create-payment-due/${payment.feeId}`,
        payment
      );
      if (response.data.success === true) {
        toast.success(
          response.data.message || "Payment due added successfully"
        );
      }
      return response.data.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create payment due"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment due"
      );
    }
  }
);

//update payment due
export const updatePaymentDue = createAsyncThunk(
  "payment/updatePaymentDue",
  async (payment: DueInput, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/payment/update-payment-due/${payment.id}`,
        payment
      );
      if (response.data.success === true) {
        toast.success(
          response.data.message || "Payment due updated successfully"
        );
      }
      return response.data.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create payment due"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment due"
      );
    }
  }
);

//delete payment
export const deletePayment = createAsyncThunk(
  "payment/deletePayment",
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/payment/delete-payment/${paymentId}`
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Payment deleted successfully");
      }
      return response.data.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete payment");
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete payment"
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
      state.submitting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // CREATE PAYMENT
    builder.addCase(createPayment.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(
      createPayment.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.submitting = false;
        state.payments = [action.payload, ...state.payments];
      }
    );
    builder.addCase(
      createPayment.rejected,
      (state, action: PayloadAction<any>) => {
        state.submitting = false;
        state.error = action.payload;
      }
    );

    // FETCH PAYMENTS
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

    // UPDATE PAYMENT
    builder.addCase(updatePayment.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(
      updatePayment.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.submitting = false;
        state.payments = state.payments.map((payment) =>
          payment.id === action.payload.id ? action.payload : payment
        );
      }
    );
    builder.addCase(
      updatePayment.rejected,
      (state, action: PayloadAction<any>) => {
        state.submitting = false;
        state.error = action.payload;
      }
    );

    // CREATE PAYMENT DUE
    builder.addCase(createPaymentDue.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(
      createPaymentDue.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.submitting = false;
        state.payments = [action.payload, ...state.payments];
      }
    );
    builder.addCase(
      createPaymentDue.rejected,
      (state, action: PayloadAction<any>) => {
        state.submitting = false;
        state.error = action.payload;
      }
    );

    // UPDATE PAYMENT DUE
    builder.addCase(updatePaymentDue.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(
      updatePaymentDue.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.submitting = false;
        console.log(action.payload);

        state.payments = state.payments.map((payment) =>
          payment.id === action.payload.id ? action.payload : payment
        );
      }
    );
    builder.addCase(
      updatePaymentDue.rejected,
      (state, action: PayloadAction<any>) => {
        state.submitting = false;
        state.error = action.payload;
      }
    );

    //delete payment
    builder.addCase(deletePayment.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(
      deletePayment.fulfilled,
      (state, action: PayloadAction<Payment>) => {
        state.submitting = false;
        state.payments = state.payments.filter(
          (payment) => payment.id !== action.payload.id
        );
      }
    );
    builder.addCase(
      deletePayment.rejected,
      (state, action: PayloadAction<any>) => {
        state.submitting = false;
        state.error = action.payload;
      }
    );
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;

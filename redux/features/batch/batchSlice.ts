import { Batch } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface BatchState {
  batches: Batch[];
  loading: boolean;
  error: string | null;
}

const initialState: BatchState = {
  batches: [],
  loading: false,
  error: null,
};

export const addBatch = createAsyncThunk<Batch, Batch>(
  "batch/add",
  async (newBatch, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/batch/add-batch`,
        newBatch
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Batch added successfully");
      }
      return response.data.data as Batch;
    } catch (error: unknown) {
      let errorMessage = "Failed to add batch";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBatches = createAsyncThunk<Batch[]>(
  "batches/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/batch/get-batches`);
      return response.data.data as Batch[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch batches";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateBatch = createAsyncThunk<Batch, Batch>(
  "batch/update",
  async (updatedBatch, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/batch/update-batch/${updatedBatch.id}`,
        updatedBatch
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Batch updated successfully");
      }
      return response.data.data as Batch;
    } catch (error: unknown) {
      let errorMessage = "Failed to update batch";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteBatch = createAsyncThunk<string, string>(
  "batch/delete",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/batch/delete-batch/${batchId}`
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Batch deleted successfully");
      }
      return batchId;
    } catch (error: unknown) {
      let errorMessage = "Failed to delete batch";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const batchSlice = createSlice({
  name: "batches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add batch
      .addCase(addBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = [...state.batches, action.payload];
      })
      .addCase(addBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add batch";
      })

      // Get batches
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch batches";
      })

      // Update batch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.map((batch) =>
          batch.id === action.payload.id ? action.payload : batch
        );
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update batch";
      })

      // Delete batch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(
          (batch) => batch.id !== action.payload
        );
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete batch";
      });
  },
});

export default batchSlice.reducer;

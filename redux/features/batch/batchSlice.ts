import { Batch, BatchResponse } from "@/lib/types";
import { BatchFormValues } from "@/lib/validation/batchSchema";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface BatchState {
  batches: Batch[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: BatchState = {
  batches: [],
  pagination: { currentPage: 1, limit: 10, totalPages: 0, totalCount: 0 },
  loading: false,
  error: null,
};
interface FetchBatchesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  mode?: string;
  location?: string;
  course?: string;
}

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

export const fetchBatches = createAsyncThunk<BatchResponse, FetchBatchesParams>(
  "batches/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        mode,
        location,
        course,
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && status !== "all" && { status }),
        ...(mode && { mode }),
        ...(location && { location }),
        ...(course && { course }),
      });

      const response = await axios.get(
        `${BASE_URL}/api/batch/get-batches?${queryParams}`
      );
      return response.data.data as BatchResponse;
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
      console.log("just befor update:", updatedBatch);
      const response = await axios.put(
        `${BASE_URL}/api/batch/update-batch/${updatedBatch.id}`,
        updatedBatch
      );
      console.log("Update Response:", response.data);
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
  reducers: {
    clearBatches: (state) => {
      state.batches = [];
      state.pagination = initialState.pagination;
    },
  },
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
        state.batches = action.payload.batches;
        state.pagination = action.payload.pagination;
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
export const { clearBatches } = batchSlice.actions;
export default batchSlice.reducer;

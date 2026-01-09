import { Batch, BatchResponse } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface DashboardStats {
  activeBatches: number;
  totalEnrollment: number;
  availableSlots: number;
  totalRevenue: number;
  outstandingFees: number;
  totalFees?: number;
}

interface BatchState {
  batches: Batch[];
  dashboardStats: DashboardStats;
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

interface FetchBatchesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  mode?: string;
  location?: string;
  course?: string;
  year?: string;
}
const initialState: BatchState = {
  batches: [],
  dashboardStats: {
    activeBatches: 0,
    totalEnrollment: 0,
    availableSlots: 0,
    totalRevenue: 0,
    outstandingFees: 0,
    totalFees: 0,
  },
  pagination: { currentPage: 1, limit: 10, totalPages: 0, totalCount: 0 },
  loading: false,
  statsLoading: false,
  error: null,
};

//add batch
export const addBatch = createAsyncThunk<Batch, Batch>(
  "batch/add",
  async (newBatch, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${BASE_URL}/api/batch/add-batch`,
        newBatch,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

//get batches
export const fetchBatches = createAsyncThunk<BatchResponse, FetchBatchesParams>(
  "batches/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/batch/get-batches`, {
        params: params || {},
      });
      console.log(response.data.data);
      
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

//fetch batch stats
export const fetchBatchStats = createAsyncThunk<
  DashboardStats,
  { location: string; year?: string }
>("batches/fetchStats", async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/batch/get-batches/stats`,
      {
        params,
      }
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue("Failed to fetch batch stats");
  }
});

export const updateBatch = createAsyncThunk<Batch, Batch>(
  "batch/update",
  async (updatedBatch, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      console.log("just befor update:", updatedBatch);
      const response = await axios.put(
        `${BASE_URL}/api/batch/update-batch/${updatedBatch.id}`,
        updatedBatch,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/batch/delete-batch/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      state.dashboardStats = initialState.dashboardStats;
      state.pagination = initialState.pagination;
    },
    setCurrentPage: (state, action) => {
      if (state.pagination) {
        state.pagination.currentPage = action.payload;
      }
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
        state.batches = [action.payload, ...state.batches];
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

      // Fetch batch stats
      .addCase(fetchBatchStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchBatchStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchBatchStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.error.message || "Failed to fetch batch stats";
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
export const { clearBatches, setCurrentPage } = batchSlice.actions;
export default batchSlice.reducer;

// src/redux/slices/communicationLogSlice.ts

import { CommunicationLog } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface CommunicationLogState {
  communicationLogs: CommunicationLog[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}
interface Pagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

// 🔹 Define the filters type
export interface FetchCommunicationLogsParams {
  page?: number;
  limit?: number;
  year?: string;
  month?: string;
  locationId?: string;
  loggedById?: string;
  search?: string;
}

interface CommunicationLogsResponse {
  communicationLogs: CommunicationLog[];
  pagination: Pagination;
}

const initialState: CommunicationLogState = {
  communicationLogs: [],
  pagination: null,
  loading: false,
  error: null,
};

// Fetch communication logs with optional filters
export const fetchCommunicationLogsByLocation = createAsyncThunk<
  CommunicationLogsResponse,
  FetchCommunicationLogsParams | undefined
>("communicationLogs/fetchByLocation", async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/communication/logs?page=${params?.page}&limit=${params?.limit}`,
      {
        params: params || {},
      }
    );

    return response.data.data as CommunicationLogsResponse;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch logs";
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue(errorMessage);
  }
});

const communicationLogSlice = createSlice({
  name: "communicationLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunicationLogsByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunicationLogsByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.communicationLogs = action.payload.communicationLogs;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCommunicationLogsByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch communication logs";
      });
  },
});

export default communicationLogSlice.reducer;

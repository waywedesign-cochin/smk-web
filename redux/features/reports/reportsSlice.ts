import { BASE_URL } from "@/redux/baseUrl";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface ReportsState {
  revenue: Report[];
  batchPerformance: Report[];
  locationsComparison: Report[];
  paymentTypeReport: Report[];
  courseRevenue: Report[];
  loading: boolean;
  error: string | null;
}
interface fetchParams {
  year: string;
  quarter?: string;
  locationId?: string;
}
interface paymentTypeReportParams {
  locationId?: string;
}

const initialState: ReportsState = {
  revenue: [],
  batchPerformance: [],
  locationsComparison: [],
  paymentTypeReport: [],
  courseRevenue: [],
  loading: false,
  error: null,
};

// Fetch revenue details
export const getRevenueDetails = createAsyncThunk<Report[], fetchParams>(
  "reports/getRevenueDetails",
  async (params, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/student/revenue-details`,
        {
          params: params ?? {},
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch batch performance
export const getBatchPerformance = createAsyncThunk<Report[], fetchParams>(
  "reports/getBatchPerformance",
  async (params, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/batch/batch-performance`,
        {
          params: params ?? {},
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data.batchPerformance;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

//fetch locations comparison
export const getLocationsComparison = createAsyncThunk<Report[], fetchParams>(
  "reports/getLocationsComparison",
  async (params, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/location/locations-comparison`,
        {
          params: params ?? {},
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

//fetch payment type report
export const getPaymentTypeReport = createAsyncThunk<
  Report[],
  paymentTypeReportParams
>("reports/getPaymentTypeReport", async (params, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payment/payment-type-report`,
      {
        params: params ?? {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data.paymentTypeReport;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

//fetch course revenue
export const getCourseRevenue = createAsyncThunk<
  Report[],
  paymentTypeReportParams
>("reports/getCourseRevenue", async (params, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${BASE_URL}/api/course/revenue-details`, {
      params: params ?? {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.courseRevenueReport;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch batch performance
      .addCase(getRevenueDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenueDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload;
      })
      .addCase(getRevenueDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch revenue details";
      })

      // Fetch batch performance
      .addCase(getBatchPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatchPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.batchPerformance = action.payload;
      })
      .addCase(getBatchPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch batch performance";
      })

      // Fetch locations comparison
      .addCase(getLocationsComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLocationsComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.locationsComparison = action.payload;
      })
      .addCase(getLocationsComparison.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch locations comparison";
      })

      // Fetch payment type report
      .addCase(getPaymentTypeReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentTypeReport.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentTypeReport = action.payload;
      })
      .addCase(getPaymentTypeReport.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch payment type report";
      })

      // Fetch course revenue
      .addCase(getCourseRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.courseRevenue = action.payload;
      })
      .addCase(getCourseRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch course revenue";
      });
  },
});

export default reportsSlice.reducer;

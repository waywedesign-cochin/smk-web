import { BASE_URL } from "@/redux/baseUrl";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface RevenueReport {
  month: string;
  revenue: number;
  collections: number;
  outstanding: number;
}

interface SummaryReport {
  totalRevenue: number;
  revenueGrowth: string;
  totalCollections: number;
  totalStudents: number;
  outstandingFees: number;
  collectionRate: string;
  newAdmissions: number;
}

interface RevenueResponse {
  summary: SummaryReport;
  monthlyData: RevenueReport[];
}

interface ReportsState {
  revenue: RevenueReport[];
  summary: SummaryReport | null;
  batchPerformance: Report[];
  locationsComparison: Report[];
  paymentTypeReport: Report[];
  courseRevenue: Report[];
  loading: boolean;
  error: string | null;
}

interface FetchParams {
  year: string;
  quarter?: string;
  locationId?: string;
}

interface PaymentTypeReportParams {
  locationId?: string;
}

const initialState: ReportsState = {
  revenue: [],
  summary: null,
  batchPerformance: [],
  locationsComparison: [],
  paymentTypeReport: [],
  courseRevenue: [],
  loading: false,
  error: null,
};

// ✅ Fetch revenue details (returns summary + monthlyData)
export const getRevenueDetails = createAsyncThunk<RevenueResponse, FetchParams>(
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
      console.log(response.data.data);
      return response.data.data; // { summary, monthlyData }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch revenue details"
      );
    }
  }
);

// ✅ Fetch batch performance
export const getBatchPerformance = createAsyncThunk<Report[], FetchParams>(
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch batch performance"
      );
    }
  }
);

// ✅ Fetch locations comparison
export const getLocationsComparison = createAsyncThunk<Report[], FetchParams>(
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations comparison"
      );
    }
  }
);

// ✅ Fetch payment type report
export const getPaymentTypeReport = createAsyncThunk<
  Report[],
  PaymentTypeReportParams
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
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch payment type report"
    );
  }
});

// ✅ Fetch course revenue
export const getCourseRevenue = createAsyncThunk<
  Report[],
  PaymentTypeReportParams
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
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch course revenue"
    );
  }
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch revenue details
      .addCase(getRevenueDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenueDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload.monthlyData;
        state.summary = action.payload.summary;
      })
      .addCase(getRevenueDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch revenue details";
      })

      // ✅ Fetch batch performance
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
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch batch performance";
      })

      // ✅ Fetch locations comparison
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
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch locations comparison";
      })

      // ✅ Fetch payment type report
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
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch payment type report";
      })

      // ✅ Fetch course revenue
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch course revenue";
      });
  },
});

export default reportsSlice.reducer;

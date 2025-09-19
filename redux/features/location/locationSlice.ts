import { Location } from "@/lib/types";
import { BASE_URL } from "@/redux/baseUrl";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null,
};

export const addLocation = createAsyncThunk<Location, Location>(
  "location/add",
  async (newLocation, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/location/add-location`,
        newLocation
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Location added successfully");
      }
      return response.data.data as Location;
    } catch (error: unknown) {
      let errorMessage = "Failed to add location";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLocations = createAsyncThunk<Location[]>(
  "locations/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/location/get-locations`
      );
      return response.data.data as Location[];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch locations";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateLocation = createAsyncThunk<Location, Location>(
  "location/update",
  async (updatedLocation, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/location/update-location/${updatedLocation.id}`,
        updatedLocation
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Location updated successfully");
      }
      return response.data.data as Location;
    } catch (error: unknown) {
      let errorMessage = "Failed to update location";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteLocation = createAsyncThunk<string, string>(
  "location/delete",
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/location/delete-location/${locationId}`
      );
      if (response.data.success === true) {
        toast.success(response.data.message || "Location deleted successfully");
      }
      return locationId;
    } catch (error: unknown) {
      let errorMessage = "Failed to delete location";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add Location
      .addCase(addLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = [...state.locations, action.payload];
      })
      .addCase(addLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add location";
      })

      // Get locations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch courses";
      })

      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.map((location) =>
          location.id === action.payload.id ? action.payload : location
        );
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update location";
      })

      // Delete location
      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(
          (location) => location.id !== action.payload
        );
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete location";
      });
  },
});

export default locationSlice.reducer;
